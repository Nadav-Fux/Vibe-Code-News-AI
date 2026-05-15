// Cloudflare Pages Function: POST /api/generate-image
//
// Generates an image via a provider and returns the URL.
//
// Body (JSON):
//   { prompt: string, width?: number, height?: number, seed?: number }
//
// Provider abstraction: env var IMAGE_PROVIDER selects backend.
// Today the only wired provider is "pollinations" (free, no key needed).
// Future: "workers-ai", "replicate".
//
// Required env:
//   EDITOR_SECRET       same gate as save-article / save-news / ai-format
//
// Optional env:
//   IMAGE_PROVIDER      "pollinations" (default)
//
// Returns:
//   200 { ok: true, provider, url, width, height, prompt }
//   400 { error, message }
//   401 { error: "unauthorized" }
//   502 { error, message }

const DEFAULT_WIDTH = 1024;
const DEFAULT_HEIGHT = 768;
const MIN_DIM = 256;
const MAX_DIM = 2048;
const MIN_PROMPT = 10;
const MAX_PROMPT = 500;

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

async function callPollinations({ prompt, width, height, seed }) {
  // Pollinations returns the image directly at this URL — no download needed,
  // just return the URL for the client to use as an <img src>.
  const params = new URLSearchParams({
    width: String(width),
    height: String(height),
    seed: String(seed),
    nologo: 'true',
    safe: 'true',
  });
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?${params}`;
  // Perform a HEAD request to validate the URL is reachable before returning.
  // This catches prompt rejection / safety blocks (Pollinations returns 4xx).
  const check = await fetch(url, { method: 'HEAD' });
  if (!check.ok) {
    throw new Error(`Pollinations returned HTTP ${check.status} — prompt may have been rejected.`);
  }
  return url;
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

  const prompt = (payload && payload.prompt && String(payload.prompt).trim()) || '';
  if (prompt.length < MIN_PROMPT) {
    return jsonResponse(400, { error: 'prompt_too_short', message: `prompt must be at least ${MIN_PROMPT} chars.` });
  }
  if (prompt.length > MAX_PROMPT) {
    return jsonResponse(400, { error: 'prompt_too_long', message: `prompt max ${MAX_PROMPT} chars.` });
  }

  const width = payload && payload.width != null ? parseInt(payload.width, 10) : DEFAULT_WIDTH;
  const height = payload && payload.height != null ? parseInt(payload.height, 10) : DEFAULT_HEIGHT;

  if (!Number.isInteger(width) || width < MIN_DIM || width > MAX_DIM) {
    return jsonResponse(400, { error: 'invalid_width', message: `width must be an integer between ${MIN_DIM} and ${MAX_DIM}.` });
  }
  if (!Number.isInteger(height) || height < MIN_DIM || height > MAX_DIM) {
    return jsonResponse(400, { error: 'invalid_height', message: `height must be an integer between ${MIN_DIM} and ${MAX_DIM}.` });
  }

  const seed = payload && payload.seed != null ? parseInt(payload.seed, 10) : Math.floor(Math.random() * 1e9);
  if (!Number.isInteger(seed)) {
    return jsonResponse(400, { error: 'invalid_seed', message: 'seed must be an integer.' });
  }

  const provider = (env.IMAGE_PROVIDER && env.IMAGE_PROVIDER.trim()) || 'pollinations';

  let url;
  try {
    if (provider === 'pollinations') {
      url = await callPollinations({ prompt, width, height, seed });
    } else {
      return jsonResponse(400, { error: 'unsupported_provider', provider: provider });
    }
  } catch (e) {
    return jsonResponse(502, { error: 'provider_error', message: e.message });
  }

  return jsonResponse(200, {
    ok: true,
    provider,
    url,
    width,
    height,
    prompt,
  });
}
