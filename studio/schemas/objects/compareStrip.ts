import {defineType, defineField} from 'sanity'

// Side-by-side comparison strip, 2-4 columns. Matches the editor's
// 'compare' block.

export const compareStrip = defineType({
  name: 'compareStrip',
  title: 'רצועת השוואה',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'עמודות (2-4)',
      type: 'array',
      validation: (R) => R.min(2).max(4),
      of: [
        {
          type: 'object',
          fields: [
            {name: 'label', title: 'תווית (mono)', type: 'string'},
            {name: 'title', title: 'כותרת', type: 'string'},
            {name: 'sub', title: 'תיאור', type: 'text', rows: 2},
          ],
          preview: {
            select: {title: 'title', subtitle: 'sub'},
          },
        },
      ],
    }),
  ],
  preview: {
    select: {items: 'items'},
    prepare: ({items}) => ({
      title: `השוואה · ${(items || []).length} עמודות`,
    }),
  },
})
