// Cloudflare Pages Function: POST /api/ai-format
//
// Takes raw text + a mode ("news" | "article") and asks an LLM to return a
// structured JSON object the studio UI can pre-fill.
//
// Body (JSON):
//   { rawText: string, mode: "news" | "article", instructions?: string }
//
// Provider abstraction is intentional — env var AI_PROVIDER selects backend.
// Today the only wired provider is Groq (free tier, fast, llama-3.3-70b).
// Tomorrow swap to OpenAI / Anthropic / Cloudflare Workers AI without
// touching callers.
//
// Required env:
//   AI_PROVIDER         "groq" (default)
//   AI_MODEL            override; defaults per provider
//   GROQ_API_KEY        when AI_PROVIDER=groq
//   EDITOR_SECRET       same gate as save-article / save-news
//
// Returns shape varies by mode:
//   mode="news":    { headline, slug, dek, body, category, urgency, channels }
//   mode="article": { title, slug, lead, sections: [{ heading, body }], takeaways }

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
    .replace(/[֐-׿]+/g, '') // strip Hebrew for slug
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || ('item-' + Date.now().toString(36));
}

function extractJson(text) {
  if (!text) return null;
  // Strip Markdown code fences if present, then try parse.
  var cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/i, '').trim();
  try { return JSON.parse(cleaned); } catch (_) { /* fall through */ }
  // Try to find the first {...} block
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

async function callGroq(env, system, user) {
  var apiKey = (env.GROQ_API_KEY || '').trim();
  if (!apiKey) throw new Error('GROQ_API_KEY not set in Cloudflare Pages env.');
  var model = (env.AI_MODEL && env.AI_MODEL.trim()) || 'llama-3.3-70b-versatile';
  var resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json',
    },
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
  if (!resp.ok) {
    throw new Error('Groq ' + resp.status + ': ' + bodyText.slice(0, 240));
  }
  try {
    var parsed = JSON.parse(bodyText);
    var content = parsed.choices && parsed.choices[0] && parsed.choices[0].message && parsed.choices[0].message.content;
    return { raw: bodyText, content: content || '' };
  } catch (e) {
    throw new Error('Groq returned non-JSON envelope: ' + bodyText.slice(0, 240));
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const { EDITOR_SECRET } = env || {};

  if (!EDITOR_SECRET) {
    return jsonResponse(500, { error: 'editor_secret_not_set' });
  }
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

  const provider = (env.AI_PROVIDER && env.AI_PROVIDER.trim()) || 'groq';
  const systemPrompt = mode === 'article' ? ARTICLE_SYSTEM_PROMPT : NEWS_SYSTEM_PROMPT;
  const userPrompt = (instructions ? 'הנחיה נוספת מהעורך: ' + instructions + '\n\n' : '')
    + 'הטקסט הגולמי לסידור:\n\n' + rawText;

  let result;
  try {
    if (provider === 'groq') {
      const groqOut = await callGroq(env, systemPrompt, userPrompt);
      result = extractJson(groqOut.content);
      if (!result) {
        return jsonResponse(502, { error: 'llm_non_json', detail: groqOut.content.slice(0, 400) });
      }
    } else {
      return jsonResponse(400, { error: 'unsupported_provider', provider: provider });
    }
  } catch (e) {
    return jsonResponse(502, { error: 'llm_error', message: e.message });
  }

  // Normalize + validate per mode
  if (mode === 'news') {
    const category = NEWS_CATEGORIES.indexOf(result.category) !== -1 ? result.category : 'update';
    const urgency = NEWS_URGENCIES.indexOf(result.urgency) !== -1 ? result.urgency : 'normal';
    const headline = (result.headline || '').toString().trim().slice(0, 140);
    const dek = (result.dek || '').toString().trim().slice(0, 280);
    const body = (result.body || '').toString().trim().slice(0, 2400);
    const slug = slugify(result.slugSuggestion || headline);
    return jsonResponse(200, {
      ok: true,
      mode: 'news',
      provider: provider,
      data: { headline, slug, dek, body, category, urgency, channels: ['web'] },
    });
  }

  // mode === 'article'
  const title = (result.title || '').toString().trim().slice(0, 140);
  const lead = (result.lead || '').toString().trim().slice(0, 700);
  const slug = slugify(result.slugSuggestion || title);
  const sections = Array.isArray(result.sections)
    ? result.sections.map((s) => ({
        heading: (s.heading || '').toString().trim().slice(0, 140),
        body: (s.body || '').toString().trim().slice(0, 2400),
      })).filter((s) => s.heading && s.body).slice(0, 6)
    : [];
  const takeaways = Array.isArray(result.takeaways)
    ? result.takeaways.map((t) => (t || '').toString().trim()).filter(Boolean).slice(0, 8)
    : [];
  return jsonResponse(200, {
    ok: true,
    mode: 'article',
    provider: provider,
    data: { title, slug, lead, sections, takeaways },
  });
}
