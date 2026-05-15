import {defineType, defineField} from 'sanity'

export const news = defineType({
  name: 'news',
  title: 'ידיעת חדשות',
  type: 'document',
  groups: [
    {name: 'content', title: 'תוכן', default: true},
    {name: 'distribution', title: 'הפצה'},
    {name: 'meta', title: 'מטא'},
  ],
  fields: [
    defineField({
      name: 'headline',
      title: 'כותרת',
      type: 'string',
      validation: (R) => R.required().min(1).max(140),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'headline', maxLength: 96},
      validation: (R) => R.required(),
      group: 'content',
    }),
    defineField({
      name: 'dek',
      title: 'Dek (משפט סיכום)',
      type: 'text',
      rows: 2,
      validation: (R) => R.required().min(1).max(280),
      group: 'content',
    }),
    defineField({
      name: 'body',
      title: 'גוף (1-3 פסקאות)',
      type: 'text',
      rows: 8,
      validation: (R) => R.required().min(1).max(2400),
      group: 'content',
    }),
    defineField({
      name: 'heroImage',
      title: 'תמונת hero (URL)',
      type: 'url',
      group: 'content',
    }),
    defineField({
      name: 'category',
      title: 'קטגוריה',
      type: 'string',
      options: {
        list: [
          {value: 'breaking', title: 'דחוף'},
          {value: 'update', title: 'עדכון'},
          {value: 'analysis', title: 'ניתוח'},
          {value: 'release', title: 'שחרור'},
          {value: 'rumor', title: 'שמועה'},
          {value: 'guide-short', title: 'מדריך קצר'},
        ],
        layout: 'radio',
      },
      initialValue: 'update',
      group: 'meta',
    }),
    defineField({
      name: 'urgency',
      title: 'דחיפות',
      type: 'string',
      options: {
        list: [
          {value: 'low', title: 'נמוך'},
          {value: 'normal', title: 'רגיל'},
          {value: 'high', title: 'גבוה'},
          {value: 'breaking', title: 'פריצה'},
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
      group: 'meta',
    }),
    defineField({
      name: 'channels',
      title: 'ערוצי פרסום',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        list: [
          {value: 'web', title: 'Web (האתר)'},
          {value: 'telegram', title: 'ערוץ Telegram'},
          {value: 'whatsapp', title: 'ערוץ WhatsApp'},
        ],
      },
      initialValue: ['web'],
      group: 'distribution',
    }),
    defineField({
      name: 'source',
      title: 'מקור (תווית)',
      type: 'string',
      group: 'meta',
    }),
    defineField({
      name: 'sourceUrl',
      title: 'URL של המקור',
      type: 'url',
      group: 'meta',
    }),
    defineField({
      name: 'status',
      title: 'סטטוס',
      type: 'string',
      options: {list: ['draft', 'published'], layout: 'radio'},
      initialValue: 'published',
      group: 'meta',
    }),
    defineField({
      name: 'publishedAt',
      title: 'תאריך פרסום',
      type: 'datetime',
      group: 'meta',
    }),
  ],
  preview: {
    select: {title: 'headline', subtitle: 'dek', media: 'heroImage'},
  },
  orderings: [
    {
      title: 'חדש לישן',
      name: 'publishedDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
})
