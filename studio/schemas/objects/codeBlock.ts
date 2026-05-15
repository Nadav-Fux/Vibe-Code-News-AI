import {defineType, defineField} from 'sanity'

// `_type: 'code'` is reserved by some Sanity plugins. We name the SCHEMA
// 'codeBlock' but keep _type='code' to match what save-article.js writes.
// Actually save-article.js writes _type='code'. To keep both consistent
// and avoid collisions, we register this as 'codeBlock' but type='object'
// so it's serialized exactly as the function emits it.

export const codeBlock = defineType({
  name: 'codeBlock',
  title: 'בלוק קוד',
  type: 'object',
  fields: [
    defineField({
      name: 'language',
      title: 'שפה',
      type: 'string',
      options: {
        list: [
          'javascript',
          'typescript',
          'tsx',
          'jsx',
          'python',
          'bash',
          'html',
          'css',
          'json',
          'yaml',
          'sql',
        ],
      },
      initialValue: 'javascript',
    }),
    defineField({
      name: 'code',
      title: 'קוד',
      type: 'text',
      rows: 10,
    }),
  ],
  preview: {
    select: {language: 'language', code: 'code'},
    prepare: ({language, code}) => ({
      title: `Code · ${language || ''}`,
      subtitle: (code || '').slice(0, 80),
    }),
  },
})
