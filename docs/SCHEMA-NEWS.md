# Sanity Schema — `news`

Short news items, separate from the long-form `article` type. Paste into your Sanity studio under `schemas/documents/news.ts` and register it in `schemas/index.ts`.

## Why a separate type

`article` is long-form (Notion-style blocks, SEO sections, FAQ). `news` is a single short post: a headline, a one-sentence dek, a 1–3 paragraph body, plus channel + urgency metadata. They render in different feeds (`/articles.html` vs `/news.html`) and have different publish paths (article = web only; news = web + telegram + whatsapp).

## Schema

```ts
import { defineType, defineField } from 'sanity';

export const news = defineType({
  name: 'news',
  title: 'News Item',
  type: 'document',
  groups: [
    { name: 'content', title: 'Content', default: true },
    { name: 'distribution', title: 'Distribution' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    defineField({
      name: 'headline',
      title: 'Headline',
      type: 'string',
      validation: (R) => R.required().min(1).max(140),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: { source: 'headline', maxLength: 96 },
      validation: (R) => R.required(),
      group: 'content',
    }),
    defineField({
      name: 'dek',
      title: 'Dek (one-line summary)',
      type: 'text',
      rows: 2,
      validation: (R) => R.required().min(1).max(280),
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'Body (1–3 short paragraphs)',
      type: 'text',
      rows: 8,
      validation: (R) => R.required().min(1).max(2400),
      group: 'content',
    }),
    defineField({
      name: 'heroImage',
      title: 'Hero image URL',
      type: 'url',
      group: 'content',
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { value: 'breaking', title: 'Breaking' },
          { value: 'update', title: 'Update' },
          { value: 'analysis', title: 'Analysis' },
          { value: 'release', title: 'Release' },
          { value: 'rumor', title: 'Rumor' },
          { value: 'guide-short', title: 'Short guide' },
        ],
        layout: 'radio',
      },
      initialValue: 'update',
      group: 'meta',
    }),
    defineField({
      name: 'urgency',
      title: 'Urgency',
      type: 'string',
      options: {
        list: ['low', 'normal', 'high', 'breaking'],
        layout: 'radio',
      },
      initialValue: 'normal',
      group: 'meta',
    }),
    defineField({
      name: 'channels',
      title: 'Publish channels',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { value: 'web', title: 'Web (this site)' },
          { value: 'telegram', title: 'Telegram channel' },
          { value: 'whatsapp', title: 'WhatsApp channel' },
        ],
      },
      initialValue: ['web'],
      group: 'distribution',
    }),
    defineField({
      name: 'source',
      title: 'Source label',
      type: 'string',
      group: 'meta',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'Source URL',
      type: 'url',
      group: 'meta',
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: { list: ['draft', 'published'], layout: 'radio' },
      initialValue: 'published',
      group: 'meta',
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published at',
      type: 'datetime',
      group: 'meta',
    }),
  ],
  preview: {
    select: { title: 'headline', subtitle: 'dek', media: 'heroImage' },
  },
  orderings: [
    {
      title: 'Published, newest',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }],
    },
  ],
});
```

## Register it

In your Sanity project's `schemas/index.ts`:

```ts
import { news } from './documents/news';

export const schemaTypes = [
  // ...existing
  news,
];
```

## Wire-up checklist

After deploying the schema to Sanity:

1. Confirm the same `SANITY_PROJECT_ID` / `SANITY_DATASET` / `SANITY_WRITE_TOKEN` / `SANITY_API_VERSION` env vars in Cloudflare Pages cover both `article` and `news` reads/writes.
2. `EDITOR_SECRET` stays the same — `save-news.js` uses the same `X-Editor-Secret` header gate as `save-article.js`.
3. Add at least one `news` document in Sanity Studio so `/news.html` has something to render.

## API surface added in this repo

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /api/save-news` | X-Editor-Secret | Create or upsert (by slug) |
| `GET /api/list-news` | none | Public read, 15s edge cache |
| `POST /api/delete-news` | X-Editor-Secret | Delete by slug |

## Telegram / WhatsApp fan-out (Phase 2)

`channels` is stored on the document but **not yet enforced**. Phase 2 will add `functions/api/publish-channel/telegram.js` and `whatsapp.js` that read `news` documents with the relevant channel and POST to the Bot APIs.
