import {defineType, defineField} from 'sanity'

// "Prompt contract" block — dark card with mono label + code.

export const prompt = defineType({
  name: 'prompt',
  title: 'כרטיס פרומפט',
  type: 'object',
  fields: [
    defineField({name: 'label', title: 'תווית (mono)', type: 'string', initialValue: 'PROMPT'}),
    defineField({name: 'code', title: 'תוכן הפרומפט', type: 'text', rows: 6}),
  ],
  preview: {
    select: {label: 'label', code: 'code'},
    prepare: ({label, code}) => ({
      title: `Prompt · ${label || ''}`,
      subtitle: (code || '').slice(0, 80),
    }),
  },
})
