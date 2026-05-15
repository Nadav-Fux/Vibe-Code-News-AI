# aiStudio plugin

Adds a `✨ סדר עם AI` document action on `news` and `article` documents.

## What it does

1. Adds an action button to the document toolbar (next to Publish).
2. Opens a Sanity `Dialog` with two fields:
   - **טקסט גולמי לעיבוד** — multiline textarea, min 20 / max 6000 chars.
   - **הנחיה לעורך (אופציונלי)** — single-line text input.
3. POSTs to `https://new.nvision.me/api/ai-format` with:
   - Header `X-Editor-Secret: <secret>` (prompted on first use, cached in `localStorage['v5_editor_secret']`).
   - Body `{ rawText, mode: 'news' | 'article', instructions? }`.
4. On success, patches the open document:
   - **news** → `headline`, `slug.current`, `dek`, `body`, `category`, `urgency`.
   - **article** → `title`, `slug.current`, `content[]` (rebuilt from `lead` + each `sections[]` heading2 + paragraphs, plus a "עיקרי דברים" H2 with bullet paragraphs if `takeaways` came back).
5. Shows a `useToast()` notification on success/failure.

## Notes

- Mode is inferred from `props.type` (no UI toggle).
- The article `content[]` is **replaced wholesale** — existing blocks are lost. Use with care.
- Editor secret is the same value the website uses (`EDITOR_SECRET` env var on Cloudflare Pages).
- `apiVersion: '2024-01-01'` on `useClient`.

## CORS / cross-origin

The Studio runs on `*.sanity.studio`, the API on `new.nvision.me`. `functions/api/ai-format.js` already returns `Access-Control-Allow-Origin: *` and allows the `X-Editor-Secret` header in preflight — no changes needed there.

## Files

- `index.ts` — `definePlugin` registration scoped to types `news` and `article`.
- `action.tsx` — the `DocumentActionComponent` with the dialog and patch logic.
