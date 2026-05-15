// Cloudflare Pages Function: POST /api/publish-telegram
//
// Two purposes:
//  1. Standalone endpoint for manual republish: POST /api/publish-telegram
//     Body: { slug: string }   Auth: X-Editor-Secret
//  2. Exported helper publishToTelegram(doc, env) called by save-news.js
//
// Required env: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID,
//               SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION,
//               SANITY_WRITE_TOKEN, EDITOR_SECRET

const SITE_URL = 'https://vibe-code-news-ai.pages.dev';

// ---------------------------------------------------------------------------
// MarkdownV2 escaping — Telegram requires escaping: _ * [ ] ( ) ~ ` > # + - = | { } . !
// We escape in body/dek/source text but NOT inside Markdown markup we
// intentionally construct (bold markers, link syntax, etc.).
// ---------------------------------------------------------------------------
export function escapeMarkdownV2(text) {
  return String(text).replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, '\\$&');
}

// ---------------------------------------------------------------------------
// Build the Telegram MarkdownV2 message from a news doc.
// ---------------------------------------------------------------------------
export function buildTelegramMessage(doc) {
  const { headline, dek, body, slug, category, urgency, sourceUrl } = doc;

  const MAX_TOTAL = 4000;

  // headline as bold (MarkdownV2 bold = *text*)
  // We escape the headline text itself before wrapping in * * so any special
  // chars inside the headline are safe, but the outer * markers are not escaped.
  const headlinePart = `*${escapeMarkdownV2(headline.trim())}*`;

  // dek and body are plain escaped text
  const dekPart = escapeMarkdownV2((dek || '').trim());

  // Category tag + urgency indicator
  const catTag = `\\#${escapeMarkdownV2(category || 'update')}${urgency === 'breaking' ? ' ⚡' : ''}`;

  // Article link — escape hyphens in the URL path as Telegram requires
  const articlePath = `/E\\-\\ Newsroom\\ Workbench/news\\.html\\#${escapeMarkdownV2(slug || '')}`;
  const articleLink = `📰 [Newsroom](${SITE_URL}/E-%20Newsroom%20Workbench/news.html#${encodeURIComponent(slug || '')})`;

  // Source link (optional)
  const sourcePart = sourceUrl ? `🔗 [מקור](${sourceUrl})` : '';

  // Assemble everything except body to calculate budget
  const footerLines = [sourcePart, catTag, articleLink].filter(Boolean);
  const footer = footerLines.join('\n');

  // Calculate remaining chars for body
  const staticLen =
    headlinePart.length + 2 +   // headline + \n\n
    dekPart.length + 2 +         // dek + \n\n
    footer.length + 2;           // footer + leading \n\n

  let bodyPart = escapeMarkdownV2((body || '').trim());
  const bodyBudget = MAX_TOTAL - staticLen;
  if (bodyPart.length > bodyBudget) {
    // Truncate and append ellipsis (escaped)
    bodyPart = bodyPart.slice(0, Math.max(0, bodyBudget - 1)) + '…';
  }

  const parts = [headlinePart, dekPart, bodyPart, footer].filter(Boolean);
  return parts.join('\n\n');
}

// ---------------------------------------------------------------------------
// Core helper — send one news doc to the Telegram channel.
// Returns { ok: true, messageId } or throws Error.
// ---------------------------------------------------------------------------
export async function publishToTelegram(doc, env) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = env || {};

  if (!TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN not set');
  if (!TELEGRAM_CHAT_ID) throw new Error('TELEGRAM_CHAT_ID not set');

  const text = buildTelegramMessage(doc);

  const apiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: 'MarkdownV2',
      disable_web_page_preview: false,
    }),
  });

  const resBody = await res.text();
  if (!res.ok) {
    // Never expose the token — just status code + beginning of body
    throw new Error(`Telegram API ${res.status}: ${resBody.slice(0, 240)}`);
  }

  let parsed;
  try { parsed = JSON.parse(resBody); } catch { parsed = {}; }
  const messageId = parsed?.result?.message_id ?? null;
  return { ok: true, messageId };
}

// ---------------------------------------------------------------------------
// Helpers shared with the endpoint handler
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Standalone endpoint: POST /api/publish-telegram  { slug }
// Looks up the doc from Sanity by slug, then calls publishToTelegram.
// ---------------------------------------------------------------------------
export async function onRequestPost(context) {
  const { request, env } = context;
  const {
    SANITY_PROJECT_ID,
    SANITY_DATASET = 'production',
    SANITY_API_VERSION = '2024-01-01',
    SANITY_WRITE_TOKEN,
    EDITOR_SECRET,
  } = env || {};

  // Auth gate
  if (!EDITOR_SECRET) return jsonResponse(500, { error: 'editor_secret_not_set' });
  if ((request.headers.get('X-Editor-Secret') || '') !== EDITOR_SECRET) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  let payload;
  try { payload = await request.json(); } catch { return jsonResponse(400, { error: 'invalid_json' }); }

  const { slug } = payload || {};
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return jsonResponse(400, { error: 'slug_invalid' });
  }

  // Sanity lookup
  if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
    return jsonResponse(500, { error: 'sanity_not_configured' });
  }

  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data`;
  const query = `*[_type == "news" && slug.current == "${slug}"][0]{headline,dek,body,slug,category,urgency,sourceUrl}`;
  const queryUrl = `${base}/query/${SANITY_DATASET}?query=${encodeURIComponent(query)}`;

  let doc;
  try {
    const r = await fetch(queryUrl, { headers: { Authorization: `Bearer ${SANITY_WRITE_TOKEN}` } });
    if (!r.ok) return jsonResponse(502, { error: 'sanity_query_failed', status: r.status });
    const j = await r.json();
    doc = j.result || null;
  } catch (e) {
    return jsonResponse(502, { error: 'sanity_fetch_error', detail: String(e.message || e) });
  }

  if (!doc || !doc.headline) {
    return jsonResponse(404, { error: 'news_not_found', slug });
  }

  // Flatten slug for the helper (it expects doc.slug as a plain string)
  doc.slug = doc.slug?.current ?? slug;

  try {
    const result = await publishToTelegram(doc, env);
    return jsonResponse(200, result);
  } catch (e) {
    return jsonResponse(502, { error: 'telegram_error', detail: String(e.message || e) });
  }
}
