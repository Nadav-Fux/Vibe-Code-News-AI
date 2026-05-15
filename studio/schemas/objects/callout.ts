import {defineType, defineField} from 'sanity'

export const callout = defineType({
  name: 'callout',
  title: 'הערה צדדית',
  type: 'object',
  fields: [
    defineField({
      name: 'tone',
      title: 'טון',
      type: 'string',
      options: {
        list: [
          {value: 'sage', title: 'Sage (ירוק)'},
          {value: 'cobalt', title: 'Cobalt (כחול)'},
          {value: 'mustard', title: 'Mustard (חרדל)'},
          {value: 'rose', title: 'Rose (ורוד)'},
        ],
        layout: 'radio',
      },
      initialValue: 'sage',
    }),
    defineField({name: 'text', title: 'טקסט', type: 'text', rows: 3}),
  ],
  preview: {
    select: {tone: 'tone', text: 'text'},
    prepare: ({tone, text}) => ({
      title: `Callout · ${tone || ''}`,
      subtitle: (text || '').slice(0, 80),
    }),
  },
})
