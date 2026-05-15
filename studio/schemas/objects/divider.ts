import {defineType} from 'sanity'

export const divider = defineType({
  name: 'divider',
  title: 'מפריד',
  type: 'object',
  fields: [{name: '_', type: 'string', hidden: true}],
  preview: {
    prepare: () => ({title: '— מפריד —'}),
  },
})
