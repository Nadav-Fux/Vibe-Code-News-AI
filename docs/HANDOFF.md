# Vibe Code News AI — Handoff

> מסמך אחד שמסכם איפה הפרויקט עומד, מה רץ אוטומטית, ומה דורש פעולה ידנית.
> תאריך עדכון: 2026-05-16. ראה גם [STATUS-PROGRESS.md](STATUS-PROGRESS.md) ו-[ROADMAP.md](ROADMAP.md).

---

## TL;DR

הפרויקט הוא AI Studio מעל Sanity לניהול **מאמרים** ארוכים ו**ידיעות** קצרות, עם פיד חי בעמוד הבית (chat widget) ופרסום רב-ערוצי (Telegram, WhatsApp בעתיד).

| מה | סטטוס |
|---|---|
| Phase 1 — פרסום (save / list / delete · feed · article wall · chat widget) | ✅ סגור |
| Phase 2A — Groq AI מסדר טקסט לטופס ידיעות | ✅ סגור |
| Phase 2B — Groq AI בעורך המאמרים (Notion-style) | ✅ סגור |
| Phase 2C — Image generation (Pollinations חינמי, provider-agnostic) | ✅ סגור |
| Phase 3-A — Research (Brave Search + Groq synthesis) ב-`+ ידיעה מהירה` | ✅ סגור |
| Phase Telegram-A — outbound (פרסום אוטומטי לערוץ) | ✅ סגור |
| Phase Telegram-B — inbound webhook (פוסט בערוץ → news draft) | ✅ סגור |
| Phase 3-B — multi-version generation (Groq + OpenAI + Anthropic במקביל) | ✅ סגור |
| Phase Telegram-C — historical import (Telegram Desktop JSON → Sanity drafts) | ✅ סגור (סקריפט) |
| Phase Stats — /admin/stats ו-/admin/channels עם data אמיתי | ✅ סגור |
| Phase Search — חיפוש + tags + pagination ב-`/articles` ו-`/news` | ✅ סגור |
| Phase Studio-Action — `✨ סדר עם AI` בתוך Sanity Studio | ✅ סגור |

האתר חי ב-`new.nvision.me` (Pages project: `vibe-code-news-ai`). Deploy אוטומטי על push ל-main.

---

## מה כבר רץ אוטומטית (אין מה לעשות)

### Cloudflare Pages env vars — production (מוגדרים דרך CF API)

| משתנה | ערך | סוג |
|---|---|---|
| `AI_PROVIDER` | `groq` | plain_text |
| `AI_MODEL` | `llama-3.3-70b-versatile` | plain_text |
| `GROQ_API_KEY` | (מ-KV `GROQ_API_KEY_1`) | **secret_text** |
| `SANITY_PROJECT_ID` | `edmzm8yr` | plain_text |
| `SANITY_DATASET` | `production` | plain_text |
| `SANITY_API_VERSION` | `2024-01-01` | plain_text |
| `EDITOR_SECRET` | (random 32-byte hex) | **secret_text** |
| `IMAGE_PROVIDER` | `pollinations` | plain_text |
| `RESEARCH_PROVIDER` | `brave` | plain_text |
| `BRAVE_SEARCH_API_KEY` | (מ-KV `BRAVE_SEARCH_API_KEY`) | **secret_text** |
| `TELEGRAM_BOT_TOKEN` | (מ-KV `TELEGRAM_BOT_TOKEN`) | **secret_text** |
| `TELEGRAM_CHAT_ID` | `7694920368` (מ-KV) | plain_text |
| `TELEGRAM_WEBHOOK_SECRET` | (random 24-byte hex) | **secret_text** |
| `OPENAI_API_KEY` | (מ-KV `OPENAI_API_KEY`) | **secret_text** |
| `OPENAI_MODEL` | `gpt-4o-mini` | plain_text |
| `ANTHROPIC_API_KEY` | (מ-KV `ANTHROPIC_API_KEY`) | **secret_text** |
| `ANTHROPIC_MODEL` | `claude-haiku-4-5-20251001` | plain_text |

> הערכים של `EDITOR_SECRET` ו-`TELEGRAM_WEBHOOK_SECRET` מועברים במסרים נפרדים. שמור את ה-EDITOR_SECRET ב-localStorage של הדפדפן (מפתח `v5_editor_secret`).

### תשתית קיימת (לא דורשת פעולה)

- **GitHub Actions** → deploy אוטומטי לכל push ל-main (`.github/workflows/deploy.yml`).
- **Cloudflare Pages** → השרת מסביב לסטטיים + `functions/api/*.js` כ-Pages Functions.
- **GROQ_API_KEY** הוטען מ-KV `spark-secrets/GROQ_API_KEY_1` ונשמר כ-secret_text ב-Pages env. מעולם לא יעלה ל-git.

---

## מה דורש פעולה ידנית ממך (3 דברים)

### 1. SANITY_WRITE_TOKEN (5 דק׳)

הטוקן ב-`.env.local` שלך **פג תוקף** (אומת מול Sanity API → 401).

```
1. גש ל-https://www.sanity.io/manage/project/edmzm8yr
2. Settings → API → Tokens → Add API token
   - Name:        "Vibe Code News AI · Editor"
   - Permissions: Editor
3. העתק את הטוקן (מוצג פעם אחת בלבד).
4. ב-Cloudflare: dashboard.cloudflare.com → Pages → vibe-code-news-ai →
   Settings → Environment variables → Production →
   Add variable: SANITY_WRITE_TOKEN = <הטוקן> · Type: Encrypt
5. Save → Redeploy מ-Deployments.
```

עד שזה ייעשה: `/api/save-article`, `/api/save-news`, `/api/delete-*` יחזירו `sanity_error` (401). הקריאות הציבוריות (`list-articles`, `list-news`) ימשיכו לעבוד אם ה-dataset ציבורי, אחרת ידרשו `SANITY_READ_TOKEN` (אופציונלי).

### 2. פרוס את ה-Sanity Studio שב-`studio/` (5 דק׳)

הוספתי studio מלא בקוד תחת `studio/` (מירור של thelaw — schemas של `article`, `news`, `aiStudioSettings`, ועוד 7 object types נחוצים ל-portable text). פעם אחת תריץ:

```powershell
cd studio
pnpm install              # או npm install
pnpm sanity login          # התחבר לחשבון Sanity שלך
pnpm sanity deploy         # מעלה ל-<hostname>.sanity.studio (בחר hostname פעם אחת)
```

מעכשיו תערוך schemas בקוד (TypeScript) + `pnpm sanity deploy` במקום sanity.io/manage UI.

ראה [studio/README.md](../studio/README.md) להוראות מפורטות.

### 3. רישום webhook ל-Telegram (פעם אחת, אחרי deploy ראשון, 1 דק׳)

ה-endpoint `https://new.nvision.me/api/telegram-webhook` כבר חי, וקיים `TELEGRAM_WEBHOOK_SECRET` ב-env. נשאר לומר ל-Telegram לשלוח לשם את האירועים:

```bash
# החלף את <SECRET> בערך של TELEGRAM_WEBHOOK_SECRET (מועבר במסר נפרד)
# וב-<BOT_TOKEN> את TELEGRAM_BOT_TOKEN (כבר ידוע לך)
curl -sS -X POST "https://api.telegram.org/bot<BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://new.nvision.me/api/telegram-webhook",
    "secret_token": "<SECRET>",
    "allowed_updates": ["channel_post", "edited_channel_post", "message", "edited_message"]
  }'
```

מעכשיו, כל פוסט בערוץ ה-Telegram יווצר אוטומטית כ-news draft ב-Sanity (ניתן לעריכה ופרסום מ-`/admin/news.html`).

### 4. הגדר `v5_editor_secret` בדפדפן (פעם אחת לדפדפן, 30 שניות)

```
1. פתח את אחד מהדפים האלה: /E - Newsroom Workbench/article.html?action=new
2. לחץ על ⚙ בסרגל העליון.
3. הדבק את ה-EDITOR_SECRET שקיבלת בנפרד.
4. שמור.
```

נשמר ב-localStorage. נדרש גם לפעולות AI (כפתור ✨ "סדר עם AI") וגם לשמירה/מחיקה.

---

## אדריכלות בשורות

```
דפדפן
   ├─ static HTML/JSX/CSS (Cloudflare Pages CDN)
   ├─ React 18 + Babel-standalone (אין build step)
   └─ POST /api/{save,list,delete,ai-format}-* (X-Editor-Secret)
                                    │
                                    ▼
                      Cloudflare Pages Function
                      (functions/api/*.js)
                                    │
              ┌─────────────────────┼─────────────────────┐
              ▼                     ▼                     ▼
        Sanity Content API    Groq Cloud API       (Phase 3+:
        (write/read by slug)  (LLM JSON)            Telegram Bot,
                                                    SERP, Brave, ...)
```

**עיקרון מפתח:** ה-write tokens של Sanity ו-API keys של AI **לא מגיעים לקוד הקליינט**. הקליינט נושא רק `EDITOR_SECRET` כקוד-מעבר; ה-Pages Function בודקת אותו ומבצעת את הקריאה האמיתית עם הסודות שלה.

---

## איך לבדוק שהכל עובד (smoke test, 5 דק׳ אחרי שהשלמת את שלושת השלבים מלמעלה)

```powershell
# מקומית — Pages Functions עם הדגלים הדרושים
npx wrangler pages dev . --port 8788 `
  --compatibility-date 2025-01-01 `
  --compatibility-flags=nodejs_compat
```

ואז בדפדפן:

| בדיקה | ציפייה |
|---|---|
| `http://localhost:8788/E - Newsroom Workbench/news.html` | פיד דמו (5 כרטיסים). אם הוספת ידיעה ב-Sanity, היא תופיע. |
| `http://localhost:8788/E - Newsroom Workbench/admin/news.html` | טבלת ידיעות + "+ ידיעה מהירה". |
| "+ ידיעה מהירה" → "✨ סדר עם AI" | הטופס מתמלא ב-headline/dek/body/category/urgency מ-Groq. |
| "שמור ופרסם" | מחזיר 200, הידיעה צצה ב-`/news.html` ובכרטיס ה-chat בעמוד הבית. |
| `http://localhost:8788/E - Newsroom Workbench/article.html?action=new` → "✨ סדר עם AI" | דיאלוג נפתח, הדבק טקסט, ה-blocks מתווספים לעורך. |

אם משהו לא עובד, פתח DevTools → Network → בדוק את ה-response של `/api/*`. שגיאות נפוצות:
- `editor_secret_not_set` → לא הגדרת `EDITOR_SECRET` ב-Pages env.
- `unauthorized` → ה-`X-Editor-Secret` של הדפדפן לא תואם את ה-Pages env.
- `sanity_not_configured` → חסר `SANITY_PROJECT_ID` או `SANITY_WRITE_TOKEN`.
- `sanity_error` 401 → טוקן Sanity פג תוקף או חסר Editor role.
- `llm_error` → `GROQ_API_KEY` לא מוגדר / מכסת חינם הסתיימה. שלוף `GROQ_API_KEY_2` או `GROQ_API_KEY_3` מ-KV.

---

## מסמכי reference פנימיים

| מסמך | מה יש שם |
|---|---|
| [STATUS-PROGRESS.md](STATUS-PROGRESS.md) | סטטוס מפורט phase by phase, gotchas, וגילויים |
| [ROADMAP.md](ROADMAP.md) | Phase 2C, Phase 3, Telegram bridge — תכנון מפורט |
| [SCHEMA-NEWS.md](SCHEMA-NEWS.md) | snippet עצמאי של ה-schema (כבר משולב ב-`studio/` המלא) |
| [studio/README.md](../studio/README.md) | הסטודיו המלא — schemas, deploy, חידוש טוקנים |
| [EDITOR_SETUP.md](../E%20-%20Newsroom%20Workbench/EDITOR_SETUP.md) | הוראות התקנה ראשונית של העורך + wrangler dev |
| `/E - Newsroom Workbench/updates.html` | אותה מידע אבל כעמוד באתר עצמו (Kanban + collapsibles) |

---

## ארגז כלים ב-KV (`spark-secrets`, ns `215100443225476ab32bea1e6411ac69`)

מפתחות זמינים לפיתוח עתידי — שלוף עם `get_kv NS KEY`:

| מפתח | למה זה טוב | סטטוס |
|---|---|---|
| `GROQ_API_KEY_2`, `GROQ_API_KEY_3` | fallback אם הראשון מסיים מכסה | זמין |
| `OPENAI_API_KEY`, `ANTHROPIC_API_KEY` | provider חלופי ל-`ai-format.js` (Phase 3-B multi-version) | זמין |
| `BRAVE_ANSWERS_API_KEY` | Brave Answers — Q&A במקום SERP | זמין |
| `SERPAPI_API_KEY`, `TAVILY_API_KEY` | providers חלופיים ל-`research.js` | זמין |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` | ✅ כבר בשימוש (outbound + inbound) | wired |
| `TELEGRAM_CMD_BOT_TOKEN`, ralph בוטים | בוטים נוספים — לפיצול אם נדרש | זמין |
| `VIBE_NEWS_SUPABASE_*` | אופציה לעבור ל-Supabase במקום Sanity | זמין |

⚠️ **אין** `SANITY_*` או `EDITOR_*` ב-KV. הראשון דורש regeneration ידני (סעיף 1 למעלה), השני נוצר אוטומטית ב-Pages env.

---

## אחרי שתשלים את 3 הצעדים

הפרויקט מוכן לפיתוח Phase 2C / 3 / Telegram. ראה `ROADMAP.md` לפירוט המשימה הבאה.
