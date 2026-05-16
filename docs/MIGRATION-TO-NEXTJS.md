# Migration Plan — Babel-in-browser → Next.js 15 on Cloudflare Pages

> **Audience:** An AI agent (or human engineer) tasked with executing this migration end-to-end. You have **zero prior context** about this project; this document is self-contained. Read it once top-to-bottom before you start. Every concrete value (project id, env var name, command) appears verbatim — do not invent.
>
> **Authored:** 2026-05-16 by Claude Opus during a Plan-B session for Nadav.
> **Status:** Approved by owner. Ready to execute.

---

## 1 · Mission

Replace a Babel-in-browser single-page-app with a real bundled Next.js 15 (App Router) application that ships SSR HTML to the browser. Goal: First Paint **under 1 second** (currently 5–7s), real SEO on news/articles, and a maintainable codebase with TypeScript.

The site is `https://new.nvision.me` — a Hebrew/RTL editorial site for **nVision Digital · White Coat News**, with two content types: long-form **articles** and short **news** items. Content lives in Sanity. Backend runs on Cloudflare Pages Functions today.

**Non-goal:** Do not redesign anything. Pixel parity with current production is the target.

---

## 2 · Current state (as of 2026-05-16)

### 2.1 Stack today

| Layer | Today | Lives at |
|---|---|---|
| Frontend | Static HTML + JSX-in-browser via **`@babel/standalone@7.29.0`** at runtime | `E - Newsroom Workbench/*.html` + `v5-*.jsx` |
| React | `react@18.3.1` + `react-dom@18.3.1` from `cdn.jsdelivr.net` (production builds, after recent perf fix) | `<script>` tags |
| Styling | Plain CSS files | `E - Newsroom Workbench/v5-*.css` |
| Backend | Cloudflare Pages Functions (Edge runtime, JS only, no build) | `functions/api/*.js` (13 endpoints) |
| Content | Sanity Studio + Content Lake | Sanity project `edmzm8yr` / dataset `production` |
| Studio | Self-hosted Sanity v3 (TypeScript, Vite-built by `sanity deploy`) | `studio/` directory — **DO NOT TOUCH** |
| Hosting | Cloudflare Pages, project `vibe-code-news-ai` (id `86dae7ee-e7f3-4abc-ad96-051d500ddbf7`) | Cloudflare account `5bf57396a7de9b1331d2ed6093af01c9` |
| Deploy | GitHub Actions → Pages, automatic on push to `main` | `.github/workflows/deploy.yml` |
| Domain | `new.nvision.me` (custom) + `vibe-code-news-ai.pages.dev` | Cloudflare DNS |
| Studio URL | `https://nvision.sanity.studio/` | Deployed separately via `pnpm sanity deploy` from `studio/` |

### 2.2 Why it's slow today

`@babel/standalone` is ~3MB and runs the JSX transpile **in the user's browser** on every cold load. React + ReactDOM CDN deliveries add another ~400KB. The main page logic (`v5-newsroom.jsx`) is ~80KB of un-bundled, un-minified JSX. There is no code splitting; every page loads everything.

### 2.3 File inventory you must replace

```
E - Newsroom Workbench/
├── index.html              → app/page.tsx                    (home)
├── news.html               → app/news/page.tsx               (public news list)
├── articles.html           → app/articles/page.tsx           (public article list)
├── article.html            → app/admin/article/page.tsx      (editor — admin)
├── project-status.html     → app/project-status/page.tsx     (status dashboard, 6 tabs)
├── updates.html            → app/updates/page.tsx            (kanban — keep or merge into status)
├── E - Newsroom Workbench.html (legacy landing — port if used, else drop)
├── v5-newsroom.jsx         → split into components/ + app/(public)/...
├── v5-editor.jsx           → app/admin/article/Editor.tsx ('use client')
├── v5-styles.css           → app/globals.css + Tailwind tokens
├── v5-editor.css           → keep as a module CSS for the editor
├── v5-news.css             → merge into globals.css
└── admin/
    ├── index.html, news.html, stats.html, channels.html, articles.html
    └── → app/admin/* mirrors
```

Variation folders `A - Bento Editorial/` through `D - Strategist Workbench/` are **frozen design references**, not deployed. Leave them on disk untouched.

### 2.4 Production env vars (already set on Cloudflare Pages)

Same env vars must work after migration. Do not change names; do not remove.

| Variable | Type | Source |
|---|---|---|
| `SANITY_PROJECT_ID` | plain_text | `edmzm8yr` |
| `SANITY_DATASET` | plain_text | `production` |
| `SANITY_API_VERSION` | plain_text | `2024-01-01` |
| `SANITY_WRITE_TOKEN` | secret_text | manually rotated via sanity.io/manage |
| `EDITOR_SECRET` | secret_text | random 32-byte hex |
| `AI_PROVIDER` | plain_text | `groq` |
| `AI_MODEL` | plain_text | `llama-3.3-70b-versatile` |
| `GROQ_API_KEY` | secret_text | from KV `GROQ_API_KEY_1` |
| `OPENAI_API_KEY` | secret_text | from KV `OPENAI_API_KEY` |
| `OPENAI_MODEL` | plain_text | `gpt-4o-mini` |
| `ANTHROPIC_API_KEY` | secret_text | from KV `ANTHROPIC_API_KEY` |
| `ANTHROPIC_MODEL` | plain_text | `claude-haiku-4-5-20251001` |
| `IMAGE_PROVIDER` | plain_text | `pollinations` |
| `RESEARCH_PROVIDER` | plain_text | `brave` |
| `BRAVE_SEARCH_API_KEY` | secret_text | from KV `BRAVE_SEARCH_API_KEY` |
| `TELEGRAM_BOT_TOKEN` | secret_text | from KV `TELEGRAM_BOT_TOKEN` |
| `TELEGRAM_CHAT_ID` | plain_text | `7694920368` |
| `TELEGRAM_WEBHOOK_SECRET` | secret_text | random 24-byte hex |

(KV namespace `215100443225476ab32bea1e6411ac69`, name `spark-secrets`, on Cloudflare account above.)

### 2.5 Pages Functions you must port (13 endpoints under `functions/api/`)

Each is a Cloudflare Pages Function with `export async function onRequestPost(context)`. They share an auth gate: client sends `X-Editor-Secret` header that must equal env `EDITOR_SECRET`. All return JSON.

| File | Purpose | Reads env |
|---|---|---|
| `save-article.js` | Upsert an article in Sanity. Body: `{ slug, title, blocks }` | `SANITY_*`, `EDITOR_SECRET` |
| `save-news.js` | Upsert a news item. Body: `{ slug, headline, dek, body, category, urgency }` | `SANITY_*`, `EDITOR_SECRET` |
| `delete-article.js` | Delete by id/slug | `SANITY_*`, `EDITOR_SECRET` |
| `delete-news.js` | Delete by id/slug | `SANITY_*`, `EDITOR_SECRET` |
| `list-articles.js` | Public read — list articles ordered by `publishedAt` desc | `SANITY_PROJECT_ID`, `SANITY_DATASET` |
| `list-news.js` | Public read — list news | same |
| `ai-format.js` | Send raw text to Groq, return structured `{ data: news|article }` | `GROQ_API_KEY`, `AI_MODEL`, `EDITOR_SECRET` |
| `ai-format-multi.js` | Parallel call to Groq + OpenAI + Anthropic; return all 3 versions | `*_API_KEY`, `EDITOR_SECRET` |
| `generate-image.js` | Generate image via Pollinations (free); return URL | `IMAGE_PROVIDER`, `EDITOR_SECRET` |
| `research.js` | Brave Search → top results → Groq synthesis → bullet summary | `BRAVE_SEARCH_API_KEY`, `GROQ_API_KEY`, `EDITOR_SECRET` |
| `publish-telegram.js` | Cross-post a news item to Telegram channel | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `EDITOR_SECRET` |
| `telegram-webhook.js` | Receive Telegram channel post → create Sanity `news` draft | `TELEGRAM_WEBHOOK_SECRET`, `SANITY_*` |
| `search.js` | Public — full-text + tag search across both content types | `SANITY_PROJECT_ID`, `SANITY_DATASET` |

Read each file before porting it. Each has a header comment explaining the contract. **Preserve the exact request/response shapes** — the browser code depends on them.

### 2.6 Sanity schemas (in `studio/schemas/`)

You do **not** edit these — the Studio is the source of truth. But you must know the shapes to type the frontend.

```
studio/schemas/
├── index.ts                    (exports schemaTypes array)
├── documents/
│   ├── article.ts              type 'article': title, slug, content (portable text), tags, publishedAt, lead, …
│   ├── news.ts                 type 'news': headline, slug, dek, body (string, not PT), category, urgency, publishedAt, channels[]
│   └── aiStudioSettings.ts     type 'aiStudioSettings' (singleton): models, prompts, defaults
└── objects/
    ├── externalImage.ts        { url, alt, caption }
    ├── codeBlock.ts            { language, code }
    ├── callout.ts              { tone, body }
    ├── tldr.ts                 { bullets: string[] }
    ├── prompt.ts               { model, text }
    ├── compareStrip.ts         { rows: [{ label, a, b }] }
    └── divider.ts              { style }
```

Use `next-sanity`'s typegen (`sanity typegen`) to derive TS types from these.

---

## 3 · Target stack

| Layer | Choice | Pinned version | Notes |
|---|---|---|---|
| Framework | **Next.js** | `^15.0.0` (App Router) | RSC by default; mark client components explicitly |
| Adapter | **`@cloudflare/next-on-pages`** | `^1.13.0` | Maintained by Cloudflare; works with Pages Functions |
| Runtime | **Edge** (Workers V8 isolate) | — | Set `export const runtime = 'edge'` on every route + page that touches I/O |
| Styling | **Tailwind CSS** + transition CSS | `^4.0.0` | Use existing `v5-styles.css` colors as CSS variables in `:root`; rewrite components to Tailwind gradually |
| Sanity client | **`next-sanity`** | latest | Has typegen, CDN-friendly fetch, RSC-compatible |
| TypeScript | yes | `^5.5.0` | strict mode on |
| Package manager | **pnpm** | `^9.x` | Already used by `studio/` |
| Node target | Node 20+ | — | Required by Sanity v4 and Next.js 15 |
| State (editor) | Zustand or React Context | — | The editor has autosave + dirty tracking; keep simple |

### 3.1 Directory structure (final)

```
/
├── studio/                     # UNTOUCHED — Sanity Studio
├── web/                        # NEW — the Next.js app
│   ├── app/
│   │   ├── layout.tsx          # RTL <html lang="he">, fonts, global theme
│   │   ├── page.tsx            # /
│   │   ├── news/
│   │   │   ├── page.tsx        # /news (list)
│   │   │   └── [slug]/page.tsx # /news/<slug>
│   │   ├── articles/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── project-status/
│   │   │   └── page.tsx        # the 6-tab status page
│   │   ├── admin/
│   │   │   ├── layout.tsx      # gate by EDITOR_SECRET presence in localStorage
│   │   │   ├── article/
│   │   │   │   └── page.tsx    # editor
│   │   │   ├── news/page.tsx
│   │   │   ├── stats/page.tsx
│   │   │   └── channels/page.tsx
│   │   └── api/                # ported Pages Functions
│   │       ├── save-article/route.ts
│   │       ├── save-news/route.ts
│   │       ├── list-articles/route.ts
│   │       ├── list-news/route.ts
│   │       ├── delete-article/route.ts
│   │       ├── delete-news/route.ts
│   │       ├── ai-format/route.ts
│   │       ├── ai-format-multi/route.ts
│   │       ├── generate-image/route.ts
│   │       ├── research/route.ts
│   │       ├── publish-telegram/route.ts
│   │       ├── telegram-webhook/route.ts
│   │       └── search/route.ts
│   ├── components/
│   │   ├── Logo.tsx            # the animated SVG (port from v5-newsroom.jsx ~line 510)
│   │   ├── Nav.tsx             # 4-item top nav
│   │   ├── Footer.tsx
│   │   ├── NewsCard.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── ChatWidget.tsx      # the floating "WhatsApp-skinned" news widget
│   │   └── editor/             # editor block components
│   ├── lib/
│   │   ├── sanity.client.ts    # createClient + helpers
│   │   ├── sanity.queries.ts   # GROQ queries
│   │   ├── editor-secret.ts    # localStorage helpers
│   │   └── env.ts              # typed access to env vars
│   ├── public/                 # static assets
│   ├── tailwind.config.ts
│   ├── next.config.mjs         # configured for edge + Cloudflare
│   ├── tsconfig.json
│   ├── package.json
│   └── wrangler.toml           # for `wrangler pages dev` locally
├── docs/                       # KEEP — includes this file
└── .github/workflows/deploy.yml  # UPDATE in Phase 5
```

`functions/api/*.js` and `E - Newsroom Workbench/` stay on disk until Phase 5 cutover succeeds. Then delete in a separate commit.

---

## 4 · Constraints (non-negotiable)

1. **Do not modify `studio/`.** The Sanity Studio is a separate deployment with its own lifecycle.
2. **Do not change Sanity schemas.** If a frontend needs a field that doesn't exist, request a schema change via the user — do not edit `studio/schemas/`.
3. **Do not change env var names.** All 18 listed in §2.4 must keep their exact names. Add new ones if needed (with `NEXT_PUBLIC_*` prefix only for non-secrets that must reach the browser).
4. **Do not change response shapes of API endpoints.** Browser code today posts with `Content-Type: application/json` + `X-Editor-Secret` header. Keep both. Return JSON with the same field names.
5. **Domain stays `new.nvision.me`.** Do not request DNS changes.
6. **Production Cloudflare Pages project name stays `vibe-code-news-ai`.** A second TEMPORARY project (`vibe-code-news-ai-next`) is allowed for testing in Phase 0; remove it after cutover.
7. **The animated SVG logo at `E - Newsroom Workbench/v5-newsroom.jsx` lines ~507-519** must be ported pixel-equivalent into `components/Logo.tsx`. It's a 48×48 dark square with `nV` letterform, a rotating dashed sage ring (14s), and a pulsing sage dot (3s). Brand wordmark is "**nVision Digital**" with mono tagline. Do not redesign.
8. **Hebrew/RTL is the default.** `<html lang="he" dir="rtl">` in `app/layout.tsx`. All text content stays in Hebrew (you'll see it in the source files — preserve exactly).

---

## 5 · Phases

Each phase is sized 1–2 hours of focused work. Stop at any phase boundary — the old site at `new.nvision.me` keeps serving until Phase 5 cutover.

### Phase 0 — Scaffold (~2h)

**Prerequisites:** Node 20+, pnpm 9+, a Cloudflare account API token with Pages:Edit scope, GitHub repo write access.

**Steps:**

```powershell
# from repo root
pnpm create next-app@latest web --typescript --app --tailwind --eslint --no-src-dir --import-alias "@/*"
cd web
pnpm add next-sanity @sanity/client @portabletext/react
pnpm add -D @cloudflare/next-on-pages vercel wrangler
```

Create `web/wrangler.toml`:

```toml
name = "vibe-code-news-ai-next"
compatibility_date = "2025-01-01"
compatibility_flags = ["nodejs_compat"]
pages_build_output_dir = ".vercel/output/static"
```

Create `web/next.config.mjs`:

```js
import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
export default {
  experimental: { runtime: 'edge' },
  reactStrictMode: true,
  images: { remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }] },
}
```

In `web/app/layout.tsx` set `<html lang="he" dir="rtl">` and import Heebo (weights 400, 600, 800) + Instrument Serif + JetBrains Mono (400, 700) via `next/font/google`.

**Deploy to a temp Cloudflare Pages project:**

```powershell
# from web/
pnpm exec next build
pnpm exec next-on-pages
# Create new Pages project in Cloudflare dashboard: name "vibe-code-news-ai-next"
# Wire build command: pnpm install && pnpm exec next-on-pages
# Wire output dir: .vercel/output/static
# Copy ALL env vars from §2.4 to this temp project
```

**Verification:**
- `pnpm dev` in `web/` renders a "Hello" page locally on http://localhost:3000
- Temp Pages URL responds with the scaffolded page
- Build log shows no Node-compat errors

**Done when:** the temp Pages URL serves a Next.js page. Production at `new.nvision.me` is untouched.

### Phase 1 — Shared UI + theme (~2h)

**Goal:** All cross-page chrome ready. No real content yet.

**Files to create in `web/`:**
- `app/layout.tsx` — HTML shell, font links, theme provider, `<Nav />`, `<Footer />`, `<ChatWidget />`
- `components/Nav.tsx` — 4 nav items: בית (`/`), חדשות (`/news`), מאמרים (`/articles`), עדכונים (`/project-status`)
- `components/Logo.tsx` — port the animated SVG (see §4 constraint 7). Read from `E - Newsroom Workbench/v5-newsroom.jsx` lines 507-519 for the exact structure.
- `components/Footer.tsx` — port from `v5-newsroom.jsx` ~line 1230-1265
- `components/ChatWidget.tsx` — port the floating chat preview, lines ~580-690
- `app/globals.css` — port CSS variables from `E - Newsroom Workbench/v5-styles.css` `:root` block. Keep variable names (`--v5-paper`, `--v5-ink`, `--v5-sage`, etc.) so legacy class names can be referenced during transition.
- `tailwind.config.ts` — map the v5 colors into Tailwind theme: `colors: { paper: 'var(--v5-paper)', ink: 'var(--v5-ink)', sage: 'var(--v5-sage)', cobalt: 'var(--v5-cobalt)', mustard: 'var(--v5-mustard)', rose: 'var(--v5-rose)', acid: 'var(--v5-acid)' }`

**Verification:**
- Visiting any temp Pages route shows the new header + footer
- Logo animates (ring rotates, dot pulses)
- Layout is RTL — Hebrew text reads right-to-left

### Phase 2 — Public pages (~2h)

**`app/page.tsx` (home):** Server component. Fetches latest 3 news + 3 articles from Sanity. ISR `revalidate: 60`. Renders hero + chat widget + cards.

**`app/news/page.tsx`:** Server component. List of news, paginated. Uses the same query shape as `functions/api/list-news.js`.

**`app/news/[slug]/page.tsx`:** Detail. `generateStaticParams` reads all slugs from Sanity at build time. Body is a string (per schema) — render with `<p>` tags split by `\n\n`.

**`app/articles/page.tsx` + `[slug]/page.tsx`:** Mirror. Body is Portable Text — use `@portabletext/react` `<PortableText />` with custom serializers for the object types (callout, tldr, prompt, compare, code, externalImage). Read `studio/schemas/objects/*.ts` to know each block's fields.

**`app/project-status/page.tsx`:** Port from `E - Newsroom Workbench/project-status.html`. 6 tabs (overview, map, fixes, editor, sanity, roadmap). All tab content is static React. Keep client-side tab state. Mark `'use client'`.

**Create `web/lib/sanity.client.ts`:**

```ts
import { createClient } from 'next-sanity'

export const sanityClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  useCdn: true,
})

export const sanityWriteClient = createClient({
  projectId: process.env.SANITY_PROJECT_ID!,
  dataset: process.env.SANITY_DATASET || 'production',
  apiVersion: process.env.SANITY_API_VERSION || '2024-01-01',
  token: process.env.SANITY_WRITE_TOKEN,
  useCdn: false,
})
```

**`web/lib/sanity.queries.ts`** — define GROQ queries: `LATEST_NEWS_Q`, `LATEST_ARTICLES_Q`, `NEWS_BY_SLUG_Q`, `ARTICLE_BY_SLUG_Q`, `ALL_NEWS_SLUGS_Q`, `ALL_ARTICLE_SLUGS_Q`.

**Verification per page:** visit on the temp Pages URL — content from Sanity renders as HTML in `view-source:`, not from JS.

### Phase 3 — Editor (~1.5h)

**`app/admin/article/page.tsx`** — `'use client'` because the editor is interactive.

Port `v5-editor.jsx` (~700 lines, 11 block types). Each block type becomes a component in `components/editor/blocks/`:

```
ParagraphBlock, HeadingBlock, ImageBlock, CodeBlock, QuoteBlock,
CalloutBlock, TldrBlock, PromptBlock, CompareBlock, DividerBlock,
ListBlock
```

State machine: a single `blocks: Block[]` array in a Zustand store. Autosave every 1.5s if dirty — debounced. Drag-to-reorder via `@dnd-kit/sortable`.

**`app/admin/layout.tsx`** — guards admin pages. On mount, read `localStorage.getItem('v5_editor_secret')`. If missing, render a settings dialog that takes the secret and saves it. All `/api/*` calls from admin pages must include header `'X-Editor-Secret': <secret>`.

**Verification:** Open `/admin/article` on the temp URL → settings dialog asks for secret → after entering it, the editor renders → typing → autosave fires → reload page → content persists (round-trip via `/api/save-article` and `/api/list-articles`).

### Phase 4 — API routes (~1h)

Port every file under `functions/api/` to `web/app/api/<name>/route.ts`. Pattern:

```ts
// web/app/api/save-article/route.ts
export const runtime = 'edge'

export async function POST(request: Request) {
  const env = process.env  // Next 15 exposes Cloudflare env via process.env on Edge runtime via @cloudflare/next-on-pages
  // … exact same logic as functions/api/save-article.js
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Editor-Secret',
    },
  })
}
```

**Important:** the existing `functions/api/*.js` files have working logic. Translate them line-by-line; don't rewrite. The contract (request body shape, response shape, status codes) is sacred — the editor depends on it during Phase 3 testing.

**Verification:** From the temp Pages URL, hit each endpoint with curl + valid X-Editor-Secret. Compare response JSON to current production response byte-by-byte.

### Phase 5 — Cutover (~30min)

**This phase requires manual Cloudflare dashboard access — the executing AI must surface clear instructions to the user.**

**Pre-cutover checklist:**
- [ ] All public pages render with content from Sanity on temp URL
- [ ] Editor saves + loads articles successfully on temp URL
- [ ] All 13 API endpoints return matching JSON to production
- [ ] Lighthouse Performance score on temp URL > 80 (production today ~30-40)
- [ ] Telegram webhook test: POST a channel message → news draft appears in Sanity

**Cutover steps (in order):**

1. **User action — Cloudflare dashboard:** Go to Pages → `vibe-code-news-ai` → Settings → Build & deployments. Change:
   - Build command: `cd web && pnpm install && pnpm exec next-on-pages`
   - Output directory: `web/.vercel/output/static`
   - Root directory: `/`
   - Save.

2. **Commit `.github/workflows/deploy.yml`** changes: build the `web/` subdir, use `cloudflare/pages-action@v1` with the same project name. The exact YAML is below in §7.2.

3. **Push to main.** GitHub Action runs. Watch the build in Cloudflare dashboard.

4. **DNS:** `new.nvision.me` already points to the `vibe-code-news-ai` Pages project. No DNS change needed.

5. **Smoke test production:** open `new.nvision.me` in incognito. Verify home, news list, news detail, article detail, editor, project-status. Telegram webhook is at `https://new.nvision.me/api/telegram-webhook` — verify it still receives.

6. **If broken:** in Cloudflare dashboard → Pages → Deployments → roll back to the previous deployment. Five seconds.

7. **Clean up (separate commit, day later):**
   - Delete `E - Newsroom Workbench/` (after backup tag)
   - Delete `functions/api/`
   - Delete root `index.html` redirect (or keep as a noop)
   - Delete the temp Pages project `vibe-code-news-ai-next`

---

## 6 · Risks + mitigations

| Risk | Mitigation |
|---|---|
| `@cloudflare/next-on-pages` Node-compat gap | Stay strict Edge; verify build in Phase 0 before any porting |
| Some env var not readable at Edge | Use `process.env.X` (next-on-pages maps it from `context.env`); test in Phase 0 |
| Sanity GROQ query returns shape doesn't match TS types | Run `sanity typegen` (or hand-write `types/sanity.ts`); strict null checks |
| Editor has subtle UX (autosave timing, drag affordances) that's hard to spec | Port `v5-editor.jsx` 1:1 first; refactor later; user does visual QA |
| Telegram webhook needs re-registration | Phase 5 step — see §7.3 |
| ISR + Cloudflare Pages — revalidation gotchas | Use Next 15's `revalidateTag` with Sanity webhook → call `/api/revalidate?tag=news` from a Sanity webhook |
| `studioHost` mismatch between `studio/sanity.cli.ts` (`nvision`) and `studio/sanity.config.ts` (`vibe-code-news`) | Out of scope — that's a Studio concern; flag to user |

---

## 7 · Reference appendices

### 7.1 Editor secret check (the auth pattern every protected route uses)

```ts
const EDITOR_SECRET = process.env.EDITOR_SECRET
if (!EDITOR_SECRET) return Response.json({ error: 'editor_secret_not_set' }, { status: 500 })

const supplied = request.headers.get('X-Editor-Secret') || ''
if (supplied !== EDITOR_SECRET) return Response.json({ error: 'unauthorized' }, { status: 401 })
```

### 7.2 GitHub Actions workflow after cutover

Replace `.github/workflows/deploy.yml` with:

```yaml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions: { contents: read, deployments: write }
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: 'pnpm', cache-dependency-path: 'web/pnpm-lock.yaml' }
      - name: Install
        run: cd web && pnpm install --frozen-lockfile
      - name: Build for Cloudflare
        run: cd web && pnpm exec next-on-pages
      - name: Deploy
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: 5bf57396a7de9b1331d2ed6093af01c9
          projectName: vibe-code-news-ai
          directory: web/.vercel/output/static
          gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### 7.3 Telegram webhook re-registration (Phase 5, after cutover)

The webhook URL stays the same (`https://new.nvision.me/api/telegram-webhook`), so re-registration is only needed if the route's TLS handshake or path changes. It shouldn't — but verify by calling:

```bash
curl -sS "https://api.telegram.org/bot<BOT_TOKEN>/getWebhookInfo"
```

If `last_error_message` is non-empty, re-register:

```bash
curl -sS -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://new.nvision.me/api/telegram-webhook",
    "secret_token": "<TELEGRAM_WEBHOOK_SECRET>",
    "allowed_updates": ["channel_post", "edited_channel_post", "message", "edited_message"]
  }'
```

(`<BOT_TOKEN>` is the value of env `TELEGRAM_BOT_TOKEN`. `<TELEGRAM_WEBHOOK_SECRET>` is the env value.)

### 7.4 Example GROQ queries (for `web/lib/sanity.queries.ts`)

```ts
export const LATEST_NEWS_Q = /* groq */ `
  *[_type == "news" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...20] {
    _id, headline, "slug": slug.current, dek, category, urgency, publishedAt, channels
  }
`

export const NEWS_BY_SLUG_Q = /* groq */ `
  *[_type == "news" && slug.current == $slug][0] {
    _id, headline, "slug": slug.current, dek, body, category, urgency, publishedAt, channels
  }
`

export const LATEST_ARTICLES_Q = /* groq */ `
  *[_type == "article" && !(_id in path("drafts.**"))] | order(publishedAt desc)[0...12] {
    _id, title, "slug": slug.current, lead, tags, publishedAt
  }
`

export const ARTICLE_BY_SLUG_Q = /* groq */ `
  *[_type == "article" && slug.current == $slug][0] {
    _id, title, "slug": slug.current, lead, content, tags, publishedAt
  }
`
```

### 7.5 Files to read before starting

Mandatory reading list, in order:

1. `docs/HANDOFF.md` — full current-state snapshot
2. `docs/STATUS-PROGRESS.md` — phase-by-phase delivery log
3. `studio/schemas/index.ts` + every file it imports
4. `functions/api/save-article.js` (canonical example of a write endpoint)
5. `functions/api/list-news.js` (canonical example of a read endpoint)
6. `E - Newsroom Workbench/v5-newsroom.jsx` lines 1-200 (constants + nav + theme tokens)
7. `E - Newsroom Workbench/v5-newsroom.jsx` lines 507-540 (header + logo)
8. `E - Newsroom Workbench/v5-editor.jsx` in full (the editor — ~700 lines)
9. `E - Newsroom Workbench/v5-styles.css` (`:root` block for tokens)
10. `E - Newsroom Workbench/project-status.html` script section (tabs structure)

---

## 8 · Acceptance criteria (definition of done)

A migration is **complete** when **all** of the following are true:

- [ ] `https://new.nvision.me` serves the Next.js build (verify via `view-source:` — should show HTML content, not `<div id="root">`)
- [ ] Lighthouse Performance ≥ 80 on home page (mobile)
- [ ] All 4 nav items work
- [ ] All 13 API endpoints return matching JSON to pre-migration production
- [ ] Editor at `/admin/article` can create, edit, and save an article round-trip to Sanity
- [ ] Telegram webhook receives a real channel post and creates a Sanity news draft
- [ ] No Babel-standalone request in the network tab
- [ ] First Paint under 1.5s on a 3G-throttled run
- [ ] `pnpm typecheck` passes in `web/`
- [ ] `pnpm lint` passes in `web/`

If any item fails, the rollback from §5 Phase 5 step 6 is one click in the Cloudflare dashboard.

---

## 9 · Out of scope (do not do these)

- Redesign or new components
- Migrate the Sanity Studio itself
- Change content (don't move articles/news around)
- Migrate to a different CMS
- Add new features (chat widget upgrades, new editor blocks, etc.)
- Touch the variation folders A/B/C/D
- Refactor the editor's block types — port the 11 existing ones, no more, no less

---

## 10 · Open questions to flag to the user (not to decide alone)

1. Should the existing `updates.html` page survive as `/updates`, or be merged into `/project-status`?
2. The `studioHost` mismatch between `studio/sanity.cli.ts` and `studio/sanity.config.ts` — which is canonical? (Probably `sanity.cli.ts` since that's the one used by the latest deploy.)
3. After cutover, should `/E - Newsroom Workbench/` be deleted immediately or kept as a frozen branch?
4. The current `EDITOR_SECRET` UX is "paste once into localStorage." Acceptable as-is, or should admin pages get a proper login (email link)?

These are deferred decisions. Note them in a separate doc; ask before merging cutover.

---

**End of plan.** Hand this file to the executing AI/engineer. Estimated total effort: **6–8 hours** of focused work over 2–3 sessions. Production downtime: **zero** (until Phase 5, where the cutover is reversible in <30s).
