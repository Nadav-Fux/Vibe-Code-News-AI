# Vibe Code News AI · Sanity Studio

Self-hosted Sanity Studio for project `edmzm8yr`. Defines all the schemas the production site reads/writes through `functions/api/*.js`.

## למה זה כאן

הסטודיו שלך לא היה בקוד עד עכשיו — כל שינוי schema היה צריך לעשות דרך sanity.io/manage. עם הסטודיו הזה:

1. Schema הוא קוד (TypeScript) — בקרת גרסאות, code review.
2. `pnpm sanity deploy` מעלה את הסטודיו ל-`<project-name>.sanity.studio` (חינם).
3. הסטודיו ב-URL הזה הוא הסטודיו שהעורכים יכנסו אליו — לא sanity.io/manage.

## התקנה ראשונית (פעם אחת)

```powershell
cd studio
pnpm install      # או npm install / yarn

# התחברות חד-פעמית לחשבון Sanity שלך
pnpm sanity login

# בחר את ה-project הקיים (edmzm8yr) — אל תיצור חדש
```

## הרצה מקומית

```powershell
cd studio
pnpm dev           # פותח Studio ב-http://localhost:3333
```

## פריסה לאינטרנט

```powershell
cd studio
pnpm sanity deploy
```

הסטודיו עולה ל-`<project-hostname>.sanity.studio`. בפעם הראשונה תתבקש לבחור hostname.

## הוצאת טוקן חדש (לתקן את ה-401 בקוד ה-Pages Functions)

הטוקן ב-`.env.local` הישן לא עבד (Sanity החזיר 401 גם ל-`/users/me`). יש לחדש:

```
1. sanity.io/manage/project/edmzm8yr → Settings → API → Tokens → Add API token
   - Name:        "Vibe Code News AI · Editor"
   - Permissions: Editor
2. העתק את הטוקן (מוצג פעם אחת בלבד)
3. ב-Cloudflare Pages: vibe-code-news-ai → Settings → Environment variables → Production
   - Add variable: SANITY_WRITE_TOKEN = <הטוקן>, Type: Encrypt
4. Redeploy מ-Deployments
```

## Schemas שכלולים

| Type | תפקיד |
|---|---|
| `article` | מאמר ארוך, Portable Text + 7 object types |
| `news` | ידיעת חדשות קצרה — headline + dek + body + category + urgency + channels |
| `aiStudioSettings` | singleton: קול עורך, ביטויים אסורים, פרומפט defaults |

Object types ב-`article.content`:
`externalImage`, `codeBlock`, `callout`, `tldr`, `prompt`, `compareStrip`, `divider`

## CORS

אם הסטודיו פרוס במקום אחר וצריך לקרוא ל-`/api/*` של האתר:
`sanity.io/manage/project/edmzm8yr → API → CORS origins → Add` עם ה-URL של הסטודיו (למשל `https://vibe-code-news.sanity.studio`).

## הערה על document IDs

`save-article.js` יוצר/מעדכן לפי `slug.current`. הסטודיו יציג אותם בצד שלך כמסמכים רגילים — אפשר לערוך אותם ב-UI במקביל לעריכה דרך האתר.
