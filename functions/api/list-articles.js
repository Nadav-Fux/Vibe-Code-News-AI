// Cloudflare Pages Function: GET /api/list-articles
// Returns all published articles for the editor's "From Sanity" tab.
// Public read — no secret required. Uses a server-side read token if configured;
// otherwise falls back to the public CDN endpoint (assumes dataset is public).

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=30, s-maxage=30',
    },
  });
}

export async function onRequestGet(context) {
  const { env } = context;
  const {
    SANITY_PROJECT_ID,
    SANITY_DATASET = 'production',
    SANITY_API_VERSION = '2024-01-01',
    SANITY_READ_TOKEN,
  } = env || {};

  if (!SANITY_PROJECT_ID) return jsonResponse(500, { error: 'sanity_project_id_missing' });

  const query = encodeURIComponent('*[_type == "article"]|order(_updatedAt desc){_id, title, "slug": slug.current, content, status, publishedAt, _createdAt, _updatedAt}');
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

  const headers = {};
  if (SANITY_READ_TOKEN) headers.Authorization = `Bearer ${SANITY_READ_TOKEN}`;

  const r = await fetch(url, { headers });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return jsonResponse(r.status, { error: 'sanity_error', detail: j });
  return jsonResponse(200, { ok: true, articles: j.result || [] });
}
