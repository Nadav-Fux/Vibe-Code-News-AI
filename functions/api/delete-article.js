// Cloudflare Pages Function: POST /api/delete-article
// Body: { slug: "article-slug" }
// Auth: X-Editor-Secret header (matches Cloudflare env EDITOR_SECRET)

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
  const { SANITY_PROJECT_ID, SANITY_DATASET = 'production', SANITY_API_VERSION = '2024-01-01', SANITY_WRITE_TOKEN, EDITOR_SECRET } = env || {};

  if (!SANITY_PROJECT_ID || !SANITY_WRITE_TOKEN || !EDITOR_SECRET) {
    return jsonResponse(500, { error: 'server_not_configured' });
  }
  if ((request.headers.get('X-Editor-Secret') || '') !== EDITOR_SECRET) {
    return jsonResponse(401, { error: 'unauthorized' });
  }

  let payload;
  try { payload = await request.json(); } catch { return jsonResponse(400, { error: 'invalid_json' }); }
  const slug = payload && payload.slug;
  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) return jsonResponse(400, { error: 'slug_invalid' });

  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data`;
  const mutateUrl = `${base}/mutate/${SANITY_DATASET}`;
  const res = await fetch(mutateUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SANITY_WRITE_TOKEN}` },
    body: JSON.stringify({
      mutations: [{ delete: { query: `*[_type == "article" && slug.current == "${slug}"]` } }],
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) return jsonResponse(res.status, { error: 'sanity_error', detail: j });
  return jsonResponse(200, { ok: true, sanity: j });
}
