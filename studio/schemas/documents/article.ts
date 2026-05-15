import {defineType, defineField, defineArrayMember} from 'sanity'

export const article = defineType({
  name: 'article',
  title: 'מאמר',
  type: 'document',
  groups: [
    {name: 'content', title: 'תוכן', default: true},
    {name: 'meta', title: 'מטא'},
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'כותרת',
      type: 'string',
      validation: (R) => R.required().min(1).max(200),
      group: 'content',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (R) => R.required(),
      group: 'content',
    }),
    defineField({
      name: 'content',
      title: 'תוכן (Notion-style blocks)',
      type: 'array',
      group: 'content',
      of: [
        defineArrayMember({
          type: 'block',
          // Match the heading levels save-article.js emits (h1–h6 + blockquote)
          styles: [
            {title: 'פסקה', value: 'normal'},
            {title: 'H1', value: 'h1'},
            {title: 'H2', value: 'h2'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'ציטוט', value: 'blockquote'},
          ],
          marks: {
            decorators: [
              {title: 'הדגשה', value: 'strong'},
              {title: 'נטוי', value: 'em'},
              {title: 'קו תחתון', value: 'underline'},
              {title: 'קוד inline', value: 'code'},
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'קישור',
                fields: [{name: 'href', type: 'url', title: 'URL'}],
              },
            ],
          },
        }),
        defineArrayMember({type: 'externalImage'}),
        defineArrayMember({type: 'codeBlock'}),
        defineArrayMember({type: 'callout'}),
        defineArrayMember({type: 'tldr'}),
        defineArrayMember({type: 'prompt'}),
        defineArrayMember({type: 'compareStrip'}),
        defineArrayMember({type: 'divider'}),
      ],
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
    defineField({
      name: 'aiArticleType',
      title: 'סוג מאמר (לפרומפט AI)',
      type: 'string',
      options: {
        list: [
          {value: 'guide', title: 'מדריך'},
          {value: 'analysis', title: 'ניתוח'},
          {value: 'review', title: 'סקירה'},
          {value: 'opinion', title: 'דעה'},
          {value: 'tutorial', title: 'הדרכה צעד-צעד'},
          {value: 'comparison', title: 'השוואה'},
        ],
      },
      group: 'meta',
    }),
    defineField({
      name: 'aiTone',
      title: 'טון (לפרומפט AI)',
      type: 'string',
      options: {
        list: [
          {value: 'measured', title: 'מאוזן'},
          {value: 'direct', title: 'ישיר'},
          {value: 'enthusiastic', title: 'נלהב'},
          {value: 'analytical', title: 'אנליטי'},
        ],
      },
      group: 'meta',
    }),
    defineField({
      name: 'aiInstructions',
      title: 'הנחיות AI ספציפיות למאמר',
      type: 'text',
      rows: 3,
      group: 'meta',
    }),
    defineField({
      name: 'aiLastError',
      title: 'שגיאת AI אחרונה (debug)',
      type: 'string',
      readOnly: true,
      group: 'meta',
    }),
  ],
  preview: {
    select: {title: 'title', subtitle: 'slug.current', media: 'content.0.url'},
  },
  orderings: [
    {
      title: 'פרסום, חדש לישן',
      name: 'publishedDesc',
      by: [{field: 'publishedAt', direction: 'desc'}],
    },
  ],
})
