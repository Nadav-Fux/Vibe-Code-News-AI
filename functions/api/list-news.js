// Cloudflare Pages Function: GET /api/list-news
// Returns all news items ordered by publishedAt desc.
// Public read.

function jsonResponse(status, body) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=15, s-maxage=15',
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

  const query = encodeURIComponent('*[_type == "news"]|order(coalesce(publishedAt, _updatedAt) desc){_id, headline, "slug": slug.current, dek, body, category, urgency, channels, source, sourceUrl, heroImage, status, publishedAt, _createdAt, _updatedAt}');
  const url = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/v${SANITY_API_VERSION}/data/query/${SANITY_DATASET}?query=${query}`;

  const headers = {};
  if (SANITY_READ_TOKEN) headers.Authorization = `Bearer ${SANITY_READ_TOKEN}`;

  const r = await fetch(url, { headers });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) return jsonResponse(r.status, { error: 'sanity_error', detail: j });
  return jsonResponse(200, { ok: true, news: j.result || [] });
}
