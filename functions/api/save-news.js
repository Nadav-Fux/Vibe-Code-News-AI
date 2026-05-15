// Cloudflare Pages Function: POST /api/save-news
//
// Creates or updates a `news` document in Sanity (short news items, separate
// from articles). Mirrors save-article.js but with the news schema fields.
//
// Required env: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_VERSION,
//               SANITY_WRITE_TOKEN, EDITOR_SECRET
// Browser sends X-Editor-Secret header.

const ALLOWED_CATEGORIES = new Set(['breaking', 'update', 'analysis', 'release', 'rumor', 'guide-short']);
const ALLOWED_URGENCY = new Set(['low', 'normal', 'high', 'breaking']);
const ALLOWED_CHANNELS = new Set(['web', 'telegram', 'whatsapp']);

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

export async function onRequestPost(context) {
  const { request, env } = context;
  const {
    SANITY_PROJECT_ID,
    SANITY_DATASET = 'production',
    SANITY_API_VERSION = '2024-01-01',
    SANITY_WRITE_TOKEN,
    EDITOR_SECRET,
  } = env || {};

  if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN) {
    return jsonResponse(500, { error: 'sanity_not_configured' });
  }
  if (!EDITOR_SECRET) {
    return jsonResponse(500, { error: 'editor_secret_not_set' });
  }
  if ((request.headers.get('X-Editor-Secret') || '') !== EDITOR_SECRET) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  let payload;
  try { payload = await request.json(); } catch { return jsonResponse(400, { error: 'invalid_json' }); }

  const { headline, slug, dek, body, category, urgency, source, sourceUrl, heroImage, channels } = payload || {};

  if (!headline || typeof headline !== 'string' || !headline.trim()) {
    return jsonResponse(400, { error: 'headline_required' });
  }
  if (headline.length > 140) {
    return jsonResponse(400, { error: 'headline_too_long', message: 'Max 140 chars.' });
  }
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return jsonResponse(400, { error: 'slug_invalid' });
  }
  if (typeof dek !== 'string' || !dek.trim() || dek.length > 280) {
    return jsonResponse(400, { error: 'dek_invalid', message: 'dek must be 1-280 chars.' });
  }
  if (typeof body !== 'string' || !body.trim() || body.length > 2400) {
    return jsonResponse(400, { error: 'body_invalid', message: 'body must be 1-2400 chars.' });
  }
  const cat = category && ALLOWED_CATEGORIES.has(category) ? category : 'update';
  const urg = urgency && ALLOWED_URGENCY.has(urgency) ? urgency : 'normal';
  const channelList = Array.isArray(channels)
    ? channels.filter((c) => ALLOWED_CHANNELS.has(c))
    : ['web'];
  if (channelList.length === 0) channelList.push('web');

  const doc = {
    _type: 'news',
    headline: headline.trim(),
    slug: { _type: 'slug', current: slug },
    dek: dek.trim(),
    body: body.trim(),
    category: cat,
    urgency: urg,
    channels: channelList,
    source: typeof source === 'string' ? source.trim().slice(0, 120) : '',
    sourceUrl: typeof sourceUrl === 'string' && /^https?:\/\//.test(sourceUrl) ? sourceUrl : '',
    heroImage: typeof heroImage === 'string' && /^https?:\/\//.test(heroImage) ? heroImage : '',
    status: 'published',
    publishedAt: new Date().toISOString(),
  };

  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data`;
  const queryUrl = `${base}/query/${SANITY_DATASET}?query=${encodeURIComponent(`*[_type == "news" && slug.current == "${slug}"][0]{_id}`)}`;

  let existing = null;
  try {
    const r = await fetch(queryUrl, { headers: { Authorization: `Bearer ${SANITY_WRITE_TOKEN}` } });
    if (r.ok) {
      const j = await r.json();
      existing = j.result || null;
    }
  } catch {
    // fall through to create
  }

  const mutations = existing && existing._id
    ? [{ patch: { id: existing._id, set: doc } }]
    : [{ create: doc }];

  const mutateUrl = `${base}/mutate/${SANITY_DATASET}?returnIds=true`;
  const sanityRes = await fetch(mutateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SANITY_WRITE_TOKEN}` },
    body: JSON.stringify({ mutations }),
  });
  const sanityJson = await sanityRes.json().catch(() => ({}));
  if (!sanityRes.ok) {
    return jsonResponse(sanityRes.status, { error: 'sanity_error', detail: sanityJson });
  }

  return jsonResponse(200, { ok: true, action: existing ? 'updated' : 'created', sanity: sanityJson });
}
