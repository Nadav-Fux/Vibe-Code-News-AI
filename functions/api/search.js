// Cloudflare Pages Function: GET/POST /api/search
// Public full-text search over Sanity content (articles + news), with filters & pagination.
//
// Params (query string for GET, JSON body for POST):
//   q?:        string         — free-text query (Hebrew + Latin allowed; sanitized)
//   type?:     'article'|'news'|'all'  (default 'all')
//   category?: string         — news category (breaking/update/analysis/release/rumor/guide-short)
//   limit?:    number         — default 12, max 50
//   offset?:   number         — default 0
//
// Returns: { ok, total, offset, limit, results: [...] }

function jsonResponse(status, body, cache) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': cache || 'public, max-age=30, s-maxage=30',
    },
  });
}

function sanitizeQuery(raw) {
  if (raw == null) return '';
  var s = String(raw).trim();
  if (!s) return '';
  // Allow latin alphanumerics, Hebrew block (U+0590-U+05FF ≈ ֐-׿), spaces, hyphen.
  s = s.replace(/[^a-zA-Z0-9֐-׿\s-]/g, ' ').replace(/\s+/g, ' ').trim();
  if (s.length > 80) s = s.slice(0, 80);
  return s;
}

function sanitizeCategory(raw) {
  var allowed = ['breaking', 'update', 'analysis', 'release', 'rumor', 'guide-short'];
  if (!raw) return '';
  var v = String(raw).trim().toLowerCase();
  return allowed.indexOf(v) >= 0 ? v : '';
}

function clampInt(v, min, max, dflt) {
  var n = parseInt(v, 10);
  if (!isFinite(n)) return dflt;
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

function buildFilter(typ, q, category) {
  // _type filter
  var typeClause;
  if (typ === 'article') typeClause = '_type == "article"';
  else if (typ === 'news') typeClause = '_type == "news"';
  else typeClause = '(_type == "article" || _type == "news")';

  var parts = [typeClause];

  // category filter (news only — articles don't have category)
  if (category) {
    if (typ === 'news') {
      parts.push('category == "' + category + '"');
    } else {
      // when type=all, only restrict news docs; articles pass-through
      parts.push('(_type == "article" || category == "' + category + '")');
    }
  }

  // full-text match across common fields. GROQ `match` is whitespace-tokenized;
  // wrap with wildcards on each token for substring-style behavior.
  if (q) {
    var tokens = q.split(/\s+/).filter(Boolean).map(function(t) { return '"*' + t + '*"'; });
    var pattern = tokens.length === 1 ? tokens[0] : '[' + tokens.join(',') + ']';
    parts.push('([title, headline, body, dek, excerpt, source] match ' + pattern + ')');
  }

  return parts.join(' && ');
}

function buildProjection() {
  return '{ _type, _id, "slug": slug.current, title, headline, dek, excerpt, body, category, urgency, source, sourceUrl, heroImage, status, publishedAt, _createdAt, _updatedAt }';
}

async function runSanity(env, groq) {
  var SANITY_PROJECT_ID = env.SANITY_PROJECT_ID;
  var SANITY_DATASET = env.SANITY_DATASET || 'production';
  var SANITY_API_VERSION = env.SANITY_API_VERSION || '2024-01-01';
  var SANITY_READ_TOKEN = env.SANITY_READ_TOKEN;
  if (!SANITY_PROJECT_ID) return { error: { status: 500, body: 'sanity_project_id_missing' } };

  var url = 'https://' + SANITY_PROJECT_ID + '.apicdn.sanity.io/v' + SANITY_API_VERSION + '/data/query/' + SANITY_DATASET + '?query=' + encodeURIComponent(groq);
  var headers = {};
  if (SANITY_READ_TOKEN) headers.Authorization = 'Bearer ' + SANITY_READ_TOKEN;

  var r = await fetch(url, { headers });
  var j = await r.json().catch(function() { return {}; });
  if (!r.ok) return { error: { status: r.status, body: j } };
  return { result: j.result };
}

async function handle(env, params) {
  var q = sanitizeQuery(params.q);
  var typ = (params.type === 'article' || params.type === 'news') ? params.type : 'all';
  var category = sanitizeCategory(params.category);
  var limit = clampInt(params.limit, 1, 50, 12);
  var offset = clampInt(params.offset, 0, 10000, 0);

  var filter = buildFilter(typ, q, category);
  var projection = buildProjection();
  var listQuery = '*[' + filter + ']|order(coalesce(publishedAt, _updatedAt) desc)[' + offset + '...' + (offset + limit) + ']' + projection;
  var countQuery = 'count(*[' + filter + '])';

  // Run both in parallel
  var listP = runSanity(env, listQuery);
  var countP = runSanity(env, countQuery);
  var listR = await listP;
  var countR = await countP;

  if (listR.error) return jsonResponse(listR.error.status, { ok: false, error: 'sanity_error', detail: listR.error.body });
  if (countR.error) return jsonResponse(countR.error.status, { ok: false, error: 'sanity_error', detail: countR.error.body });

  var results = Array.isArray(listR.result) ? listR.result : [];
  // Strip heavy body field to keep payload light — keep a 300-char excerpt only.
  results = results.map(function(it) {
    var body = typeof it.body === 'string' ? it.body : '';
    var clone = Object.assign({}, it);
    if (body && body.length > 300) clone.bodyPreview = body.slice(0, 300);
    else if (body) clone.bodyPreview = body;
    delete clone.body;
    return clone;
  });

  return jsonResponse(200, {
    ok: true,
    total: typeof countR.result === 'number' ? countR.result : results.length,
    offset: offset,
    limit: limit,
    q: q,
    type: typ,
    category: category,
    results: results,
  });
}

export async function onRequestGet(context) {
  var url = new URL(context.request.url);
  var params = {
    q: url.searchParams.get('q') || '',
    type: url.searchParams.get('type') || 'all',
    category: url.searchParams.get('category') || '',
    limit: url.searchParams.get('limit'),
    offset: url.searchParams.get('offset'),
  };
  return handle(context.env || {}, params);
}

export async function onRequestPost(context) {
  var body = {};
  try { body = await context.request.json(); } catch (e) { body = {}; }
  return handle(context.env || {}, body || {});
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  });
}
