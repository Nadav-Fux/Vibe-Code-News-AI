import {defineType, defineField} from 'sanity'

export const tldr = defineType({
  name: 'tldr',
  title: 'TL;DR',
  type: 'object',
  fields: [
    defineField({name: 'text', title: 'תקציר', type: 'text', rows: 3}),
  ],
  preview: {
    select: {text: 'text'},
    prepare: ({text}) => ({title: 'TL;DR', subtitle: (text || '').slice(0, 80)}),
  },
})
