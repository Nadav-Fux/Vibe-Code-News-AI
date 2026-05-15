/**
 * aiStudio plugin — registers the "✨ סדר עם AI" document action
 * on `news` and `article` types.
 */
import {definePlugin} from 'sanity'
import {aiFormatAction} from './action'

export const aiStudio = definePlugin({
  name: 'aiStudio',
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'news' || context.schemaType === 'article') {
        return [...prev, aiFormatAction]
      }
      return prev
    },
  },
})
