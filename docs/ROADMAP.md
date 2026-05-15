# ROADMAP — nVision AI · Newsroom Workbench

> **עדכון אחרון:** 15 במאי 2026  
> Phase 1 ✅ · Phase 2A ✅ · Phase 2B ⏳ · Phase 3 🗺️

---

## Phase 2B — AI assist in article editor · ⏳ בעבודה

**מטרה:** להוסיף את אפשרות "סדר עם AI" גם לעורך המאמרים (block editor), כך שניתן לקחת טקסט גולמי ולהמיר אותו לבלוקים מובנים.

### משימות

- [ ] הוספת כפתור ✨ **"סדר עם AI"** לסרגל הכלים של `v5-editor.jsx`
  - מצב `mode=article` → שולח את הטקסט ל-`/api/ai-format`
  - התגובה מפוצלת לפי כותרות/סעיפים לבלוקים מסוג `heading2` + `paragraph`
  - הבלוקים מוזרקים ל-editor state
- [ ] **AI image generation block** — בלוק תמונה שמקבל prompt ומחזיר תמונה (ראה Phase 3 לפרטי provider)

### תלויות

- `functions/api/ai-format.js` — קיים ועובד (Phase 2A)
- `v5-editor.jsx` — ניתן להוסיף כפתור לסרגל `v5e-editor-bar-r`

---

## Phase 3 — Research + multi-version generation · 🗺️ מתוכנן

### 3.1 · `/api/research` — חיפוש חי

**מטרה:** לתת לכותב "חפש לי רקע על X" ולקבל תמציות ממקורות חיים.

```
POST /api/research
Body: { query: "...", providers: ["brave", "grok"] }
Response: { results: [{ title, url, snippet }] }
```

| Provider | מפתח בKV | הערות |
|---|---|---|
| Brave Search | `BRAVE_SEARCH_API_KEY` | API חינמי עד 2K/חודש |
| Grok (X/Twitter) | `GROK_API_KEY` | חיפוש ב-X בלבד |
| SERP (Google) | — | יידרש CloakBrowser |

### 3.2 · Multi-version generation toggle

**מטרה:** הרצת אותו פרומפט מול 2–3 providers ובחירת הגרסה הטובה ביותר.

- UI: כרטיסיות A / B / C עם הגרסאות
- הצבעה / בחירה → הגרסה הנבחרת מוזרקת ל-editor
- Providers: Groq (נוכחי) · Anthropic Claude · OpenAI

### 3.3 · AI image generation

**מטרה:** בלוק תמונה שמייצר תמונות מ-prompt בתוך editor.

| Provider | עלות | מהירות |
|---|---|---|
| **Pollinations.ai** | חינמי (no API key) | ~3s |
| **Cloudflare Workers AI** `flux-1-schnell-fp8` | pay-per-use | ~5s |
| DALL-E 3 | $0.04/תמונה | ~10s |

**ברירת מחדל ראשונה:** Pollinations — `https://image.pollinations.ai/prompt/{encoded_prompt}`

---

## Telegram bridge · 🗺️ track נפרד

### Outbound — שידור לערוץ

כאשר מפרסמים `news` עם `channels.includes('telegram')`:

```
POST https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage
Body: { chat_id: TELEGRAM_CHAT_ID, text: "...", parse_mode: "HTML" }
```

**מיקום ממומש:** `functions/api/save-news.js` — לאחר שמירת Sanity, שולח לבוט.

### Inbound — קבלת הודעות מהערוץ

```
POST /api/telegram-webhook
Verifies: X-Telegram-Bot-Api-Secret-Token header
Action: creates a news draft in Sanity with status="draft"
```

הגדרת webhook:
```
curl "https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://vibe-code-news-ai.pages.dev/api/telegram-webhook"
```

### Historical retrieve — ייבוא היסטוריה

סקריפט חד-פעמי (Node.js):

```js
// pulls up to 100 messages from channel history
// seeds each as a Sanity news doc with status="imported"
```

### Bot tokens בKV (spark-secrets)

| מפתח | תיאור |
|---|---|
| `TELEGRAM_BOT_TOKEN` | בוט ראשי |
| `TELEGRAM_CHAT_ID` | מזהה הערוץ |
| `TELEGRAM_CMD_BOT_TOKEN` | בוט פקודות (admin) |
| Ralph bots (×2) | בוטים ייעודיים |

---

## לוח זמנים משוער

| Phase | ETA | תנאי מוקדם |
|---|---|---|
| 2B | שבוע הבא | Opus מעבד כרגע |
| 3.3 (image gen) | +2 שבועות | לאחר 2B |
| 3.1 (research) | +3 שבועות | אחרי 3.3 |
| 3.2 (multi-version) | +4 שבועות | אחרי 3.1 |
| Telegram outbound | +2 שבועות | SANITY_PROJECT_ID חייב להיות מוגדר |
| Telegram inbound + historical | +5 שבועות | אחרי outbound יציב |

---

*ראה גם: [STATUS-PROGRESS.md](STATUS-PROGRESS.md) · [SCHEMA-NEWS.md](SCHEMA-NEWS.md)*
