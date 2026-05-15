import {defineType, defineField} from 'sanity'

// Stored in article.content. Matches what save-article.js emits when an
// editor pastes an image URL — we keep the URL as-is rather than uploading
// to Sanity Asset Pipeline (no Sanity write needed for the asset).

export const externalImage = defineType({
  name: 'externalImage',
  title: 'תמונה (URL חיצוני)',
  type: 'object',
  fields: [
    defineField({name: 'url', title: 'URL', type: 'url', validation: (R) => R.required()}),
    defineField({name: 'alt', title: 'Alt text', type: 'string'}),
  ],
  preview: {
    select: {title: 'alt', subtitle: 'url', media: 'url'},
    prepare: ({title, subtitle}) => ({
      title: title || 'תמונה',
      subtitle: subtitle || '',
    }),
  },
})
