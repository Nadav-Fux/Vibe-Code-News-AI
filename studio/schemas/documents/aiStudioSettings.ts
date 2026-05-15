import {defineType, defineField} from 'sanity'

// Singleton — id 'aiStudioSettings'. Holds editorial voice + AI prompt
// guidance the /api/ai-format function can read so it doesn't need
// hardcoded prompts.

export const aiStudioSettings = defineType({
  name: 'aiStudioSettings',
  title: 'הגדרות AI Studio',
  type: 'document',
  fields: [
    defineField({
      name: 'editorialVoice',
      title: 'קול עורך — איך המערכת כותבת',
      description: 'משפט-שניים שמתארים את הטון, הקהל, והרגישויות של האתר.',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'requiredDisclaimers',
      title: 'הסתייגויות חובה',
      description: 'משפטים שיתווספו אוטומטית בסוף מאמרים מסוימים (יישום עתידי).',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'forbiddenTerms',
      title: 'ביטויים שאסור להשתמש בהם',
      description: 'AI יימנע מהמונחים האלה. למשל קלישאות, מתחרים, מינוחים שגויים.',
      type: 'array',
      of: [{type: 'string'}],
    }),
    defineField({
      name: 'defaultArticleType',
      title: 'ברירת מחדל ל-aiArticleType',
      type: 'string',
      initialValue: 'guide',
    }),
    defineField({
      name: 'defaultTone',
      title: 'ברירת מחדל ל-aiTone',
      type: 'string',
      initialValue: 'measured',
    }),
    defineField({
      name: 'promptVersion',
      title: 'גרסת prompt',
      description: 'הגדל בכל שינוי משמעותי כדי שתוכל לעקוב מאיזו גרסה כל מאמר נוצר.',
      type: 'number',
      initialValue: 1,
    }),
  ],
  preview: {
    prepare: () => ({title: 'הגדרות AI Studio (singleton)'}),
  },
})
