# Article Editor — Setup

The Notion-style editor in `articles.html?action=new` saves to localStorage automatically and can publish to Sanity via a Cloudflare Pages Function. Local editing works with zero setup; Sanity publishing needs three things wired up.

## Architecture

```
Browser  ──POST /api/save-article──>  Pages Function  ──> Sanity Content API
   │           (X-Editor-Secret)          (write token,       (create / patch
   │                                       server-side env)    by slug)
   │
   └──── localStorage v5_articles (always, even offline) ────
```

The write token never leaves the Cloudflare worker. The browser only carries an `X-Editor-Secret` value (stored in localStorage) which the worker compares against an env var to gate access.

## One-time setup

### 1. GitHub repository secrets

`Settings → Secrets and variables → Actions → New repository secret`:

| Secret | Value |
|---|---|
| `SANITY_PROJECT_ID`      | Your Sanity project id (e.g. `edmzm8yr`) |
| `SANITY_DATASET`         | `production` (or your dataset name) |
| `SANITY_API_VERSION`     | `2024-01-01` |
| `SANITY_API_READ_TOKEN`  | (Optional) Sanity Viewer token if dataset is private |
| `CLOUDFLARE_API_TOKEN`   | Cloudflare token with Pages permission |
| `CLOUDFLARE_ACCOUNT_ID`  | Cloudflare account id |

These are injected into the static JS bundle by `.github/scripts/inject-env.js` during deploy. **No write token here.**

### 2. Cloudflare Pages environment variables

`Cloudflare Dashboard → Pages → vibe-code-news-ai → Settings → Environment variables → Production`:

| Var | Value |
|---|---|
| `SANITY_PROJECT_ID`    | Same as above |
| `SANITY_DATASET`       | `production` |
| `SANITY_API_VERSION`   | `2024-01-01` |
| `SANITY_READ_TOKEN`    | (Optional) only if `/api/list-articles` needs a private dataset |
| `SANITY_WRITE_TOKEN`   | Sanity Editor token. **Lives only here.** |
| `EDITOR_SECRET`        | A long random string (e.g. `openssl rand -hex 32`). The browser will send this back in `X-Editor-Secret`. |
| `AI_PROVIDER`          | `groq` (default). Reserved — future values: `openai`, `anthropic`, `workers-ai`. |
| `AI_MODEL`             | Optional override. Defaults to `llama-3.3-70b-versatile` for Groq. |
| `GROQ_API_KEY`         | Groq cloud API key. Required when `AI_PROVIDER=groq`. Used by `/api/ai-format`. |

These env vars are read at request time by the Pages Functions in `functions/api/`. They're never injected into the static bundle.

### 3. Browser setup

1. Open `articles.html?action=new`.
2. Click the **⚙** button in the top action bar.
3. Paste your `EDITOR_SECRET` value and save.

Stored in `localStorage` under `v5_editor_secret`. Required per browser; not synced between devices.

## How the editor works

| Action | What happens |
|---|---|
| Type in any block | Autosaves to localStorage 1.5s after last keystroke |
| `/` at the start of an empty paragraph | Opens slash menu — pick a block type |
| Click `⋮⋮` on a block | Opens the block menu: convert / insert / move / delete |
| Drag `⋮⋮` | Reorders blocks. Blue line shows where it lands. |
| Click **תצוגה מקדימה** | Renders the article inside the real `V5ArticleTemplate` chrome — what readers will see |
| Click **שמור ופרסם** | Saves locally always; if `EDITOR_SECRET` is set, also publishes to Sanity |

## Block types

| Block | When to use |
|---|---|
| `paragraph` | Body text |
| `lead` | Opening paragraph — bigger type, sets up the article |
| `heading2` / `heading3` | Section / subsection titles. Auto-populate the reading map rail |
| `quote` | Pullquote (Instrument Serif italic, cobalt rule) |
| `image` | Paste an image URL. Add alt text below for SEO + caption |
| `code` | Code block with language selector |
| `method` | Prompt contract / framework card (dark, with mono label like `PROMPT CONTRACT`) |
| `compare` | Side-by-side comparison strip, 2–4 columns |
| `tldr` | Single TL;DR block — renders in the rail at the top of the article |
| `callout` | Inline author's note. Choose tone: sage / cobalt / mustard / rose |
| `divider` | Section break between chapters |

## Pages Function endpoints

- `POST /api/save-article` — `{ title, slug, blocks }`, header `X-Editor-Secret`. Returns `{ ok, action: 'created' | 'updated' }`.
- `POST /api/delete-article` — `{ slug }`, header `X-Editor-Secret`. Returns `{ ok }`.
- `GET /api/list-articles` — Public. Returns all published articles from Sanity for listing UIs.

## Local dev (running Pages Functions)

```powershell
npx wrangler pages dev . --port 8788 `
  --compatibility-date 2025-01-01 `
  --compatibility-flags=nodejs_compat
```

The `nodejs_compat` flag is recommended even though our current functions don't need `process.env` — the moment any imported module touches `process.env` transitively, `wrangler pages dev` cold-starts will throw `ReferenceError: process is not defined`. Documented gotcha from a sister project.

Then open `http://localhost:8788/E - Newsroom Workbench/news.html` (or any page) — the static files are served and `/api/*` routes hit the local functions.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Editor says "Editor Secret שגוי" | The secret in localStorage doesn't match `EDITOR_SECRET` in Cloudflare. Open ⚙, fix it. |
| Editor says "Sanity לא מוגדר בשרת" | Missing `SANITY_PROJECT_ID` or `SANITY_WRITE_TOKEN` in Cloudflare Pages env. |
| Toast says "שמירה מקומית בלבד" | No `EDITOR_SECRET` set in the browser yet — only localStorage saves happen. |
| Build fails with "inject-env.js refused to run" | The inject script only runs in GitHub Actions (`CI=true`). Set `FORCE_INJECT=1` to override locally — but normally don't, that's a footgun (overwrites source with real tokens). |
