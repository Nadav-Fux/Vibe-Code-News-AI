// Cloudflare Pages Function: POST /api/ai-format-multi
//
// Same input shape as /api/ai-format, but fans out to THREE providers in
// parallel (Groq + OpenAI + Anthropic) and returns all three results so the
// editor can show a "pick the best" UI.
//
// Body (JSON):
//   { rawText: string, mode: "news" | "article", instructions?: string }
//
// Required env:
//   EDITOR_SECRET        same gate as ai-format / save-news
//   GROQ_API_KEY         provider 1 (already wired)
//   OPENAI_API_KEY       provider 2 (optional — graceful if missing)
//   ANTHROPIC_API_KEY    provider 3 (optional — graceful if missing)
// Optional model overrides:
//   GROQ_MODEL           default 'llama-3.3-70b-versatile'
//   OPENAI_MODEL         default 'gpt-4o-mini'
//   ANTHROPIC_MODEL      default 'claude-haiku-4-5-20251001'
//
// Response:
//   { ok: true, mode, versions: [{ provider, model, ok, data?, reason?, elapsedMs }] }
// 200 if at least one provider succeeded; 502 if all failed.

const NEWS_CATEGORIES = ['breaking', 'update', 'analysis', 'release', 'rumor', 'guide-short'];
const NEWS_URGENCIES = ['low', 'normal', 'high', 'breaking'];

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Editor-Secret',
    },
  });
}

export async function onRequestOptions() {
  return jsonResponse(204, {});
}

function slugify(s) {
  if (!s) return '';
  return s.toString().trim().toLowerCase()
    .replace(/[֐-׿]+/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || ('item-' + Date.now().toString(36));
}

function extractJson(text) {
  if (!text) return null;
  var cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }
  var match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try { return JSON.parse(match[0]); } catch (_) { /* fall through */ }
  }
  return null;
}

const NEWS_SYSTEM_PROMPT = `אתה עורך חדשות שמסדר טקסט גולמי בעברית למבנה מובנה לאתר חדשות AI.
החזר JSON בלבד (ללא הסבר, ללא code fences) במבנה הבא:
{
  "headline": "כותרת ראשית, עד 140 תווים, ענייני וברור",
  "dek": "משפט סיכום של עד 280 תווים שמרחיב על הכותרת",
  "body": "1-3 פסקאות קצרות, עברית טבעית, בלי קלישאות. סך הכל 200-800 תווים. פסקאות מופרדות בשורה ריקה",
  "category": "אחד מ: breaking | update | analysis | release | rumor | guide-short",
  "urgency": "אחד מ: low | normal | high | breaking",
  "slugSuggestion": "סלאג אנגלי (a-z, 0-9, hyphens), עד 80 תווים"
}
אם המידע חלקי - השלם בצורה סבירה אך אל תמציא עובדות.`;

const ARTICLE_SYSTEM_PROMPT = `אתה עורך תוכן שמסדר טקסט גולמי לכתבה מובנית.
החזר JSON בלבד במבנה:
{
  "title": "כותרת המאמר",
  "lead": "פסקת פתיחה שמושכת את הקורא, 1-2 משפטים",
  "sections": [
    { "heading": "כותרת תת-סעיף", "body": "תוכן 2-3 פסקאות" }
  ],
  "takeaways": ["נקודת לקח 1", "נקודת לקח 2", "נקודת לקח 3"],
  "slugSuggestion": "english-slug"
}
מינימום 3 sections, מקסימום 6. אל תמציא עובדות.`;

// ---------- Provider callers ----------

async function callGroq(env, system, user) {
  var apiKey = (env.GROQ_API_KEY || '').trim();
  if (!apiKey) { var e = new Error('no_key'); e.reason = 'no_key'; throw e; }
  var model = (env.GROQ_MODEL && env.GROQ_MODEL.trim()) || 'llama-3.3-70b-versatile';
  var resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      temperature: 0.4,
      max_tokens: 2400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  var bodyText = await resp.text();
  if (!resp.ok) throw new Error('Groq ' + resp.status + ': ' + bodyText.slice(0, 240));
  var parsed = JSON.parse(bodyText);
  var content = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
  return { model: model, content: content || '' };
}

async function callOpenAI(env, system, user) {
  var apiKey = (env.OPENAI_API_KEY || '').trim();
  if (!apiKey) { var e = new Error('no_key'); e.reason = 'no_key'; throw e; }
  var model = (env.OPENAI_MODEL && env.OPENAI_MODEL.trim()) || 'gpt-4o-mini';
  var resp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model,
      temperature: 0.4,
      max_tokens: 2400,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
    }),
  });
  var bodyText = await resp.text();
  if (!resp.ok) throw new Error('OpenAI ' + resp.status + ': ' + bodyText.slice(0, 240));
  var parsed = JSON.parse(bodyText);
  var content = parsed && parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
  return { model: model, content: content || '' };
}

async function callAnthropic(env, system, user) {
  var apiKey = (env.ANTHROPIC_API_KEY || '').trim();
  if (!apiKey) { var e = new Error('no_key'); e.reason = 'no_key'; throw e; }
  var model = (env.ANTHROPIC_MODEL && env.ANTHROPIC_MODEL.trim()) || 'claude-haiku-4-5-20251001';
  // Anthropic has no native JSON mode — reinforce in the user message.
  var userWithJsonHint = user + '\n\nהשב JSON תקין בלבד, ללא הסבר וללא code fences.';
  var resp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 2400,
      temperature: 0.4,
      system: system,
      messages: [{ role: 'user', content: userWithJsonHint }],
    }),
  });
  var bodyText = await resp.text();
  if (!resp.ok) throw new Error('Anthropic ' + resp.status + ': ' + bodyText.slice(0, 240));
  var parsed = JSON.parse(bodyText);
  var content = '';
  if (parsed && Array.isArray(parsed.content)) {
    content = parsed.content.map(function (c) { return (c && c.type === 'text') ? c.text : ''; }).join('');
  }
  return { model: model, content: content || '' };
}

// ---------- Normalizers (mirror ai-format.js shape) ----------

function normalizeNews(result) {
  if (!result) return null;
  var category = NEWS_CATEGORIES.indexOf(result.category) !== -1 ? result.category : 'update';
  var urgency = NEWS_URGENCIES.indexOf(result.urgency) !== -1 ? result.urgency : 'normal';
  var headline = (result.headline || '').toString().trim().slice(0, 140);
  var dek = (result.dek || '').toString().trim().slice(0, 280);
  var body = (result.body || '').toString().trim().slice(0, 2400);
  var slug = slugify(result.slugSuggestion || headline);
  return { headline: headline, slug: slug, dek: dek, body: body, category: category, urgency: urgency, channels: ['web'] };
}

function normalizeArticle(result) {
  if (!result) return null;
  var title = (result.title || '').toString().trim().slice(0, 140);
  var lead = (result.lead || '').toString().trim().slice(0, 700);
  var slug = slugify(result.slugSuggestion || title);
  var sections = Array.isArray(result.sections)
    ? result.sections.map(function (s) {
        return {
          heading: (s.heading || '').toString().trim().slice(0, 140),
          body: (s.body || '').toString().trim().slice(0, 2400),
        };
      }).filter(function (s) { return s.heading && s.body; }).slice(0, 6)
    : [];
  var takeaways = Array.isArray(result.takeaways)
    ? result.takeaways.map(function (t) { return (t || '').toString().trim(); }).filter(Boolean).slice(0, 8)
    : [];
  return { title: title, slug: slug, lead: lead, sections: sections, takeaways: takeaways };
}

// ---------- Single attempt wrapper (returns version entry, never throws) ----------

async function runProvider(name, defaultModel, callFn, env, system, user, mode) {
  var started = Date.now();
  try {
    var out = await callFn(env, system, user);
    var elapsed = Date.now() - started;
    var parsed = extractJson(out.content);
    if (!parsed) {
      return { provider: name, model: out.model || defaultModel, ok: false, reason: 'non_json', detail: (out.content || '').slice(0, 200), elapsedMs: elapsed };
    }
    var data = mode === 'article' ? normalizeArticle(parsed) : normalizeNews(parsed);
    if (!data || (mode === 'news' && !data.headline) || (mode === 'article' && !data.title)) {
      return { provider: name, model: out.model || defaultModel, ok: false, reason: 'empty_result', elapsedMs: elapsed };
    }
    return { provider: name, model: out.model || defaultModel, ok: true, data: data, elapsedMs: elapsed };
  } catch (e) {
    var elapsed2 = Date.now() - started;
    var reason = e && e.reason ? e.reason : 'error';
    return { provider: name, model: defaultModel, ok: false, reason: reason, message: e && e.message ? e.message.slice(0, 240) : String(e), elapsedMs: elapsed2 };
  }
}

// ---------- Handler ----------

export async function onRequestPost(context) {
  const { request, env } = context;
  const { EDITOR_SECRET } = env || {};

  if (!EDITOR_SECRET) return jsonResponse(500, { error: 'editor_secret_not_set' });
  if ((request.headers.get('X-Editor-Secret') || '') !== EDITOR_SECRET) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  let payload;
  try { payload = await request.json(); } catch { return jsonResponse(400, { error: 'invalid_json' }); }

  const rawText = (payload && payload.rawText && String(payload.rawText).trim()) || '';
  const mode = payload && payload.mode === 'article' ? 'article' : 'news';
  const instructions = (payload && payload.instructions && String(payload.instructions).trim()) || '';

  if (rawText.length < 20) {
    return jsonResponse(400, { error: 'raw_text_too_short', message: 'rawText must be at least 20 chars.' });
  }
  if (rawText.length > 6000) {
    return jsonResponse(400, { error: 'raw_text_too_long', message: 'rawText max 6000 chars (chunk it first).' });
  }

  const systemPrompt = mode === 'article' ? ARTICLE_SYSTEM_PROMPT : NEWS_SYSTEM_PROMPT;
  const userPrompt = (instructions ? 'הנחיה נוספת מהעורך: ' + instructions + '\n\n' : '')
    + 'הטקסט הגולמי לסידור:\n\n' + rawText;

  const groqModel = (env.GROQ_MODEL && env.GROQ_MODEL.trim()) || 'llama-3.3-70b-versatile';
  const openaiModel = (env.OPENAI_MODEL && env.OPENAI_MODEL.trim()) || 'gpt-4o-mini';
  const anthropicModel = (env.ANTHROPIC_MODEL && env.ANTHROPIC_MODEL.trim()) || 'claude-haiku-4-5-20251001';

  const results = await Promise.allSettled([
    runProvider('groq', groqModel, callGroq, env, systemPrompt, userPrompt, mode),
    runProvider('openai', openaiModel, callOpenAI, env, systemPrompt, userPrompt, mode),
    runProvider('anthropic', anthropicModel, callAnthropic, env, systemPrompt, userPrompt, mode),
  ]);

  const versions = results.map(function (r, i) {
    if (r.status === 'fulfilled') return r.value;
    // Defensive: runProvider already catches its own errors, but just in case.
    const fallbackName = ['groq', 'openai', 'anthropic'][i];
    const fallbackModel = [groqModel, openaiModel, anthropicModel][i];
    return { provider: fallbackName, model: fallbackModel, ok: false, reason: 'error', message: (r.reason && r.reason.message) || 'unknown' };
  });

  const anyOk = versions.some(function (v) { return v.ok; });
  return jsonResponse(anyOk ? 200 : 502, { ok: anyOk, mode: mode, versions: versions });
}
