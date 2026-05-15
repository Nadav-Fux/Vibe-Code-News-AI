// Cloudflare Pages Function: POST /api/telegram-webhook
//
// Receives Telegram updates (channel_post / message) and creates a Sanity
// `news` draft for each one. The editor can later review the draft in
// /admin/news.html and promote it to published.
//
// Setup (one-time):
//   1. Set env var TELEGRAM_WEBHOOK_SECRET in Cloudflare Pages (already done).
//   2. Tell Telegram where to send updates and what secret to embed:
//
//      curl -sS -X POST \
//        "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook" \
//        -H "Content-Type: application/json" \
//        -d '{
//          "url": "https://new.nvision.me/api/telegram-webhook",
//          "secret_token": "<value-of-TELEGRAM_WEBHOOK_SECRET>",
//          "allowed_updates": ["channel_post", "message", "edited_channel_post"]
//        }'
//
//      Telegram then POSTs every channel_post / message to that URL and
//      passes the secret back in the X-Telegram-Bot-Api-Secret-Token header.
//
// Required env:
//   TELEGRAM_WEBHOOK_SECRET  Random secret matching what setWebhook was called with
//   SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION, SANITY_WRITE_TOKEN
//
// Notes:
// - We always return 200 to Telegram even on internal failure, so Telegram
//   does not retry forever. Failures are logged in the response body and
//   visible in the Pages Functions log.
// - Idempotency: slug is derived from message_id, so re-delivery of the
//   same update produces an upsert (Sanity patch instead of create), not a
//   duplicate document.
// - We accept ONLY text messages. Photos, videos, polls, etc. are skipped
//   (200 ok, action: 'skipped').

const MAX_HEADLINE_LEN = 140;
const MAX_DEK_LEN = 280;
const MAX_BODY_LEN = 2400;

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

function detectUrgency(text) {
  if (!text) return 'normal';
  const t = text.toLowerCase();
  if (/⚡|🚨|breaking|מבזק|פריצת דרך/i.test(text)) return 'breaking';
  if (/🔥|דחוף|חשוב/i.test(text)) return 'high';
  return 'normal';
}

function detectCategory(text) {
  if (!text) return 'update';
  if (/release|השק|הוצא|launches/i.test(text)) return 'release';
  if (/analysis|ניתוח|בדיקה/i.test(text)) return 'analysis';
  if (/rumor|שמועה|טוענים|מדברים על/i.test(text)) return 'rumor';
  if (/מדריך|guide|how to|איך/i.test(text)) return 'guide-short';
  if (/breaking|מבזק|דחוף/i.test(text)) return 'breaking';
  return 'update';
}

function extractFirstUrl(text) {
  if (!text) return '';
  const m = text.match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : '';
}

// Turn raw Telegram text into a usable news draft.
// We don't have AI here — this is a fast pre-fill so the editor can finish in /admin.
function buildDraftFromText(text, messageId) {
  const lines = (text || '').split(/\n+/).map((s) => s.trim()).filter(Boolean);
  let headline = (lines[0] || 'ידיעה מ-Telegram').slice(0, MAX_HEADLINE_LEN);
  // If the first line ends with punctuation, treat the second as dek.
  let dek = '';
  let bodyStart = 1;
  if (lines.length >= 2 && lines[0].length <= 140) {
    dek = lines[1].slice(0, MAX_DEK_LEN);
    bodyStart = 2;
  }
  // Fallback: if no dek emerged, derive from headline
  if (!dek) dek = headline.slice(0, MAX_DEK_LEN);
  const body = lines.slice(bodyStart).join('\n\n').slice(0, MAX_BODY_LEN) || dek;

  return {
    _type: 'news',
    headline,
    dek,
    body,
    slug: { _type: 'slug', current: 'tg-' + String(messageId) },
    category: detectCategory(text),
    urgency: detectUrgency(text),
    channels: ['telegram-source'],
    source: 'Telegram',
    sourceUrl: extractFirstUrl(text),
    heroImage: '',
    status: 'draft',
    publishedAt: new Date().toISOString(),
  };
}

async function persistDraft(doc, env) {
  const projectId = (env.SANITY_PROJECT_ID || '').trim();
  const dataset = (env.SANITY_DATASET || 'production').trim();
  const apiVersion = (env.SANITY_API_VERSION || '2024-01-01').trim();
  const token = (env.SANITY_WRITE_TOKEN || '').trim();
  if (!projectId || !token) throw new Error('sanity_not_configured');

  const slugStr = doc.slug.current;
  const base = `https://${projectId}.api.sanity.io/v${apiVersion}/data`;
  const queryUrl = `${base}/query/${dataset}?query=${encodeURIComponent(
    `*[_type == "news" && slug.current == "${slugStr}"][0]{_id}`,
  )}`;

  let existing = null;
  try {
    const r = await fetch(queryUrl, { headers: { Authorization: `Bearer ${token}` } });
    if (r.ok) {
      const j = await r.json();
      existing = j.result || null;
    }
  } catch {
    // fall through to create
  }

  // Drafts in Sanity live under _id `drafts.<uuid>`. We use the slug-based id so
  // re-delivery upserts cleanly.
  const draftId = 'drafts.tg-' + slugStr.replace(/^tg-/, '');
  const mutations = existing && existing._id
    ? [{ patch: { id: existing._id, set: doc } }]
    : [{ createOrReplace: { ...doc, _id: draftId } }];

  const mutateUrl = `${base}/mutate/${dataset}?returnIds=true`;
  const r = await fetch(mutateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ mutations }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error('sanity_' + r.status + ': ' + JSON.stringify(j).slice(0, 200));
  return j;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Verify Telegram secret token. If unset on our side, refuse — operator
  // must configure both sides.
  const expectedSecret = (env.TELEGRAM_WEBHOOK_SECRET || '').trim();
  if (!expectedSecret) {
    // Don't tell Telegram to retry forever — log + 200.
    return jsonResponse(200, { ok: false, error: 'webhook_secret_not_set' });
  }
  const sentSecret = request.headers.get('X-Telegram-Bot-Api-Secret-Token') || '';
  if (sentSecret !== expectedSecret) {
    return jsonResponse(401, { ok: false, error: 'invalid_telegram_secret' });
  }

  let update;
  try {
    update = await request.json();
  } catch {
    return jsonResponse(200, { ok: false, error: 'invalid_json' });
  }

  // Telegram update kinds: channel_post (channels), edited_channel_post,
  // message (DMs / groups), edited_message. We treat all 4 as "incoming post".
  const post =
    update.channel_post ||
    update.edited_channel_post ||
    update.message ||
    update.edited_message ||
    null;

  if (!post) {
    return jsonResponse(200, { ok: true, action: 'skipped_no_post', update_id: update.update_id });
  }

  // We accept text-only for the MVP. Captions on photos/videos are also text-ish;
  // if `caption` exists, treat as text (the image_id is ignored — could be wired
  // to Sanity asset upload in a later phase).
  const text = post.text || post.caption || '';
  if (!text || text.length < 4) {
    return jsonResponse(200, { ok: true, action: 'skipped_no_text', message_id: post.message_id });
  }

  // Commands like "/start" are not content.
  if (/^\/[a-z]/i.test(text)) {
    return jsonResponse(200, { ok: true, action: 'skipped_command', message_id: post.message_id });
  }

  const doc = buildDraftFromText(text, post.message_id);

  try {
    const result = await persistDraft(doc, env);
    return jsonResponse(200, {
      ok: true,
      action: 'draft_created',
      message_id: post.message_id,
      slug: doc.slug.current,
      sanity_ids: result.results?.map((r) => r.id) || [],
    });
  } catch (e) {
    return jsonResponse(200, {
      ok: false,
      action: 'persist_failed',
      message_id: post.message_id,
      error: String(e.message || e),
    });
  }
}

// Telegram doesn't actually use GET, but it's useful as a healthcheck.
export async function onRequestGet(context) {
  const { env } = context;
  return jsonResponse(200, {
    ok: true,
    healthcheck: 'telegram-webhook',
    secret_set: !!(env.TELEGRAM_WEBHOOK_SECRET || '').trim(),
    sanity_configured: !!(env.SANITY_PROJECT_ID && env.SANITY_WRITE_TOKEN),
  });
}
