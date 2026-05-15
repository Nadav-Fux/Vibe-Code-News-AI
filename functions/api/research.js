// Cloudflare Pages Function: POST /api/research
//
// Finds sources for a news topic via Brave Search, then synthesises them with Groq.
//
// Body (JSON):
//   { topic: string, mode?: "news" | "article", maxResults?: number }
//
// Required env:
//   EDITOR_SECRET          auth gate (same as save-news / ai-format)
//   BRAVE_SEARCH_API_KEY   Brave Search subscription token
//   GROQ_API_KEY           Groq API key
//   RESEARCH_PROVIDER      optional, default "brave" (future: serpapi | tavily | grok-x)
//
// Returns:
//   { ok, provider, topic, sourcesFound, sources:[{title,url,description,age}], data:{...} }

const NEWS_CATEGORIES = ['breaking', 'update', 'analysis', 'release', 'rumor', 'guide-short'];
const NEWS_URGENCIES  = ['low', 'normal', 'high', 'breaking'];

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
    .replace(/[֐-׿]+/g, '')        // strip Hebrew characters for slug
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

// ── Brave Search ────────────────────────────────────────────────────────────

async function searchBrave(env, topic, maxResults) {
  var apiKey = (env.BRAVE_SEARCH_API_KEY || '').trim();
  if (!apiKey) throw new Error('BRAVE_SEARCH_API_KEY not set in Cloudflare Pages env.');

  var url = 'https://api.search.brave.com/res/v1/web/search'
    + '?q=' + encodeURIComponent(topic)
    + '&count=' + maxResults
    + '&country=IL'
    + '&search_lang=he';

  var resp = await fetch(url, {
    headers: {
      'X-Subscription-Token': apiKey,
      'Accept': 'application/json',
    },
  });

  var bodyText = await resp.text();
  if (!resp.ok) {
    throw new Error('Brave Search ' + resp.status + ': ' + bodyText.slice(0, 240));
  }

  var data;
  try { data = JSON.parse(bodyText); } catch (e) {
    throw new Error('Brave Search returned non-JSON: ' + bodyText.slice(0, 240));
  }

  var raw = (data && data.web && Array.isArray(data.web.results)) ? data.web.results : [];
  return raw.map(function (r) {
    return {
      title:       (r.title       || '').toString().trim(),
      url:         (r.url         || '').toString().trim(),
      description: (r.description || '').toString().trim(),
      age:         (r.age         || '').toString().trim(),
    };
  }).filter(function (r) { return r.url; });
}

// ── Groq synthesis ──────────────────────────────────────────────────────────

var RESEARCH_SYSTEM_PROMPT = `אתה עורך חדשות שמסנתז תוצאות חיפוש לידיעת חדשות מובנית בעברית.
החזר JSON בלבד (ללא הסבר, ללא code fences) במבנה הבא בדיוק:
{
  "headline": "כותרת ראשית, עד 140 תווים, ענייני וברור",
  "dek": "משפט סיכום של עד 280 תווים שמרחיב על הכותרת",
  "body": "1-3 פסקאות קצרות, עברית טבעית, בלי קלישאות. 200-800 תווים. פסקאות מופרדות בשורה ריקה.",
  "category": "אחד מ: breaking | update | analysis | release | rumor | guide-short",
  "urgency": "אחד מ: low | normal | high | breaking",
  "primarySource": "ה-URL המקורי המרכזי ביותר מהרשימה",
  "sourceLabel": "שם מקוצר של המקור, לדוגמה: TechCrunch, Anthropic blog, Ynet"
}
אל תמציא עובדות שאינן בתוצאות החיפוש. אם המידע חלקי — ציין זאת בגוף הידיעה.`;

async function callGroq(env, systemPrompt, userPrompt) {
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
      temperature: 0.35,
      max_tokens: 1800,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userPrompt },
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

// ── Provider router (extensible) ────────────────────────────────────────────

async function fetchSources(provider, env, topic, maxResults) {
  if (provider === 'brave') {
    return searchBrave(env, topic, maxResults);
  }
  // Future: serpapi | tavily | grok-x
  throw new Error('unsupported_research_provider: ' + provider);
}

// ── Main handler ────────────────────────────────────────────────────────────

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

  var topic      = (payload && payload.topic && String(payload.topic).trim()) || '';
  var mode       = payload && payload.mode === 'article' ? 'article' : 'news';
  var maxResults = Math.min(10, Math.max(1, parseInt(payload && payload.maxResults, 10) || 5));

  if (topic.length < 5) {
    return jsonResponse(400, { error: 'topic_too_short', message: 'topic must be at least 5 chars.' });
  }
  if (topic.length > 200) {
    return jsonResponse(400, { error: 'topic_too_long', message: 'topic max 200 chars.' });
  }

  var provider = (env.RESEARCH_PROVIDER && env.RESEARCH_PROVIDER.trim()) || 'brave';

  // 1. Fetch sources
  var sources;
  try {
    sources = await fetchSources(provider, env, topic, maxResults);
  } catch (e) {
    return jsonResponse(502, { error: 'search_error', message: e.message });
  }

  if (!sources.length) {
    return jsonResponse(200, {
      ok: false,
      provider: provider + '+groq',
      topic: topic,
      sourcesFound: 0,
      sources: [],
      error: 'no_results',
      message: 'Brave Search returned no results for this topic.',
    });
  }

  // 2. Build user prompt with numbered source list
  var sourcesText = sources.map(function (s, i) {
    var line = (i + 1) + '. ' + s.title + '\n   ' + s.url;
    if (s.description) line += '\n   ' + s.description;
    if (s.age)         line += '\n   (גיל: ' + s.age + ')';
    return line;
  }).join('\n\n');

  var userPrompt = 'נושא: ' + topic + '.\nהנה תוצאות החיפוש, סדר את זה לידיעת חדשות:\n\n' + sourcesText;

  // 3. Synthesise with Groq
  var groqOut;
  try {
    groqOut = await callGroq(env, RESEARCH_SYSTEM_PROMPT, userPrompt);
  } catch (e) {
    return jsonResponse(502, { error: 'llm_error', message: e.message });
  }

  var result = extractJson(groqOut.content);
  if (!result) {
    return jsonResponse(502, { error: 'llm_non_json', detail: groqOut.content.slice(0, 400) });
  }

  // 4. Normalise output
  var category    = NEWS_CATEGORIES.indexOf(result.category) !== -1 ? result.category : 'update';
  var urgency     = NEWS_URGENCIES.indexOf(result.urgency)   !== -1 ? result.urgency   : 'normal';
  var headline    = (result.headline    || '').toString().trim().slice(0, 140);
  var dek         = (result.dek         || '').toString().trim().slice(0, 280);
  var body        = (result.body        || '').toString().trim().slice(0, 2400);
  var primarySrc  = (result.primarySource || '').toString().trim();
  var sourceLabel = (result.sourceLabel  || '').toString().trim();
  var slug        = slugify(headline);

  // Fallback: if primarySource is not one of the found URLs, use the first result
  if (!primarySrc && sources.length) primarySrc = sources[0].url;
  if (!sourceLabel && sources.length) sourceLabel = sources[0].title.split(' ')[0] || '';

  return jsonResponse(200, {
    ok: true,
    provider: provider + '+groq',
    topic: topic,
    sourcesFound: sources.length,
    sources: sources,
    data: {
      headline,
      slug,
      dek,
      body,
      category,
      urgency,
      channels: ['web'],
      sourceUrl: primarySrc,
      source:    sourceLabel,
    },
  });
}
