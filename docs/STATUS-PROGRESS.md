# STATUS-PROGRESS — nVision AI · Newsroom Workbench

> **עדכון אחרון:** 15 במאי 2026 · commit `b7b2b9a`

---

## Phase 1 — Publishing flow · ✅ הושלם

| פריט | קובץ / מיקום | סטטוס |
|---|---|---|
| News Sanity schema | `docs/SCHEMA-NEWS.md` | ✅ |
| Pages Function: שמירת חדשות | `functions/api/save-news.js` | ✅ |
| Pages Function: רשימת חדשות | `functions/api/list-news.js` | ✅ |
| Pages Function: מחיקת חדשות | `functions/api/delete-news.js` | ✅ |
| `/news.html` — פיד היברידי | timeline ↔ grid | ✅ |
| NewsCard — 3 מצבי פתיחה | expand · popup · WhatsApp | ✅ |
| Studio shell | `admin/` (5 עמודים) | ✅ |
| טופס חדשות מהיר | `admin/news.html` | ✅ |
| Chat widget בעמוד הבית | WhatsApp / Telegram / Messenger | ✅ |
| Article wall בעמוד הבית | wired to `/api/list-articles` | ✅ |
| `EDITOR_SETUP.md` | wrangler dev + `nodejs_compat` | ✅ |

---

## Phase 2A — AI formatting (news) · ✅ הושלם

| פריט | פרטים | סטטוס |
|---|---|---|
| `/api/ai-format` Pages Function | provider-agnostic; Groq wired: `llama-3.3-70b-versatile` | ✅ |
| כפתור "סדר עם AI" | ב-`admin/news.html` (quick-form) | ✅ |
| Cloudflare Pages env vars | `AI_PROVIDER`, `AI_MODEL`, `GROQ_API_KEY` מוגדרים | ✅ |

---

## Phase 2B — AI assist in article editor · ⏳ בעבודה

| פריט | פרטים | סטטוס |
|---|---|---|
| כפתור "סדר עם AI" ב-`v5-editor.jsx` | mode=`article` → splits sections into editor blocks | ⏳ |
| AI image generation block | נכלל בהודעת commit אך עדיין לא ממומש | ⏳ |

---

## Phase 3 — Research + multi-version · 🗺️ מתוכנן

| פריט | פרטים | סטטוס |
|---|---|---|
| `/api/research` | SERP / Brave / Grok-on-Twitter | 🗺️ |
| Multi-version generation toggle | 2–3 providers, user picks | 🗺️ |
| AI image generation | Pollinations / Cloudflare Workers AI flux-1-schnell-fp8 | 🗺️ |

---

## Telegram bridge · 🗺️ track נפרד

| פריט | פרטים | סטטוס |
|---|---|---|
| Outbound | publish עם `channels.includes('telegram')` → Bot API `sendMessage` | 🗺️ |
| Inbound webhook | Telegram → draft חדשות ב-Sanity | 🗺️ |
| Historical retrieve | script חד-פעמי — שולף היסטוריית ערוץ ל-Sanity | 🗺️ |
| Bot tokens | `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_CMD_BOT_TOKEN` + שני בוטים Ralph — נמצאים ב-KV | ✅ |

---

## ⚠️ הגדרות ידניות נדרשות

המשתנים הבאים **טרם הוגדרו** ב-Cloudflare Pages env vars לפרויקט `vibe-code-news-ai`. עד שיוגדרו, ה-editor וה-news endpoints **לא יעבדו מקצה לקצה**:

```
SANITY_PROJECT_ID
SANITY_DATASET
SANITY_WRITE_TOKEN
SANITY_API_VERSION
EDITOR_SECRET
```

לצורך הגדרה: Cloudflare Dashboard → Pages → `vibe-code-news-ai` → Settings → Environment variables.

### Supabase alternative (לתשומת לב)

ב-KV קיימים מפתחות:

```
VIBE_NEWS_SUPABASE_URL
VIBE_NEWS_SUPABASE_ANON_KEY
VIBE_NEWS_SUPABASE_SERVICE_ROLE_KEY
```

הקוד הנוכחי הוא Sanity-only. מעבר ל-Supabase ידרוש migration.

---

*מסמך זה נוצר אוטומטית — ראה גם [ROADMAP.md](ROADMAP.md) ו-[SCHEMA-NEWS.md](SCHEMA-NEWS.md)*
