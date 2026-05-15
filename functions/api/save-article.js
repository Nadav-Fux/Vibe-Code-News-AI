// Cloudflare Pages Function: POST /api/save-article
//
// Receives an article payload from the browser editor and proxies a create-or-update
// mutation to the Sanity Content API. Holds the Sanity write token server-side so it
// never reaches the client bundle.
//
// Required Cloudflare env vars (Pages → Settings → Environment variables):
//   SANITY_PROJECT_ID         e.g. "edmzm8yr"
//   SANITY_DATASET            e.g. "production"
//   SANITY_API_VERSION        e.g. "2024-01-01"
//   SANITY_WRITE_TOKEN        Sanity API token with Editor/Write permission
//   EDITOR_SECRET             A long random string. The browser sends it as
//                             X-Editor-Secret. Acts as the gate so the public can't
//                             POST junk to your dataset.
//
// Browser side: store the secret once in localStorage under key `v5_editor_secret`.

const ALLOWED_TYPES = new Set(['paragraph', 'heading', 'image', 'code', 'quote', 'callout', 'tldr', 'prompt', 'compare', 'divider']);

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
    return jsonResponse(500, { error: 'sanity_not_configured', message: 'Server is missing Sanity project id or write token.' });
  }
  if (!EDITOR_SECRET) {
    return jsonResponse(500, { error: 'editor_secret_not_set', message: 'Server is missing EDITOR_SECRET. Set it in Cloudflare Pages env.' });
  }

  const supplied = request.headers.get('X-Editor-Secret') || '';
  if (supplied !== EDITOR_SECRET) {
    return jsonResponse(401, { error: 'unauthorized', message: 'Missing or invalid X-Editor-Secret header.' });
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return jsonResponse(400, { error: 'invalid_json', message: 'Body must be valid JSON.' });
  }

  const { title, slug, blocks } = payload || {};
  if (!title || typeof title !== 'string' || !title.trim()) {
    return jsonResponse(400, { error: 'title_required' });
  }
  if (!slug || typeof slug !== 'string' || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) {
    return jsonResponse(400, { error: 'slug_invalid', message: 'Slug must be lowercase a-z, 0-9, hyphen.' });
  }
  if (!Array.isArray(blocks) || blocks.length === 0) {
    return jsonResponse(400, { error: 'blocks_required' });
  }
  for (const b of blocks) {
    if (!b || typeof b !== 'object' || !ALLOWED_TYPES.has(b.type)) {
      return jsonResponse(400, { error: 'block_invalid', message: `Unknown block type: ${b && b.type}` });
    }
  }

  const sanityBlocks = blocks.map(blockToSanity);
  const doc = {
    _type: 'article',
    title: title.trim(),
    slug: { _type: 'slug', current: slug },
    content: sanityBlocks,
    status: 'published',
    publishedAt: new Date().toISOString(),
  };

  const base = `https://${SANITY_PROJECT_ID}.api.sanity.io/v${SANITY_API_VERSION}/data`;
  const queryUrl = `${base}/query/${SANITY_DATASET}?query=${encodeURIComponent(`*[_type == "article" && slug.current == "${slug}"][0]{_id}`)}`;

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
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${SANITY_WRITE_TOKEN}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const sanityJson = await sanityRes.json().catch(() => ({}));
  if (!sanityRes.ok) {
    return jsonResponse(sanityRes.status, { error: 'sanity_error', detail: sanityJson });
  }

  return jsonResponse(200, { ok: true, action: existing ? 'updated' : 'created', sanity: sanityJson });
}

function blockToSanity(b) {
  const text = typeof b.content === 'string' ? b.content : '';
  switch (b.type) {
    case 'heading': {
      const m = text.match(/^(#{1,6})\s/);
      const level = m ? m[1].length : (b.level || 2);
      return { _type: 'block', style: `h${level}`, markDefs: [], children: [{ _type: 'span', text: m ? text.replace(/^#{1,6}\s/, '') : text, marks: [] }] };
    }
    case 'quote':
      return { _type: 'block', style: 'blockquote', markDefs: [], children: [{ _type: 'span', text, marks: [] }] };
    case 'image':
      // Editor passes a URL or asset reference; if URL we store as a custom externalImage block.
      // Real upload-to-assets is a separate Pages Function.
      return { _type: 'externalImage', url: text, alt: b.alt || '' };
    case 'code':
      return { _type: 'code', code: text, language: b.language || 'javascript' };
    case 'callout':
      return { _type: 'callout', tone: b.tone || 'sage', text };
    case 'tldr':
      return { _type: 'tldr', text };
    case 'prompt':
      return { _type: 'prompt', label: b.label || 'PROMPT', code: text };
    case 'compare':
      return { _type: 'compareStrip', items: Array.isArray(b.items) ? b.items : [] };
    case 'divider':
      return { _type: 'divider' };
    case 'paragraph':
    default:
      return { _type: 'block', style: 'normal', markDefs: [], children: [{ _type: 'span', text, marks: [] }] };
  }
}
