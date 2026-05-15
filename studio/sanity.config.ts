import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemas'
import {aiStudio} from './plugins/aiStudio'

export default defineConfig({
  name: 'vibe-code-news-ai',
  title: 'Vibe Code News · Studio',
  projectId: 'edmzm8yr',
  dataset: 'production',
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('תוכן')
          .items([
            S.listItem()
              .title('הגדרות AI Studio')
              .id('aiStudioSettings')
              .child(
                S.document()
                  .schemaType('aiStudioSettings')
                  .documentId('aiStudioSettings')
                  .title('הגדרות AI Studio')
              ),
            S.divider(),
            S.listItem()
              .title('מאמרים')
              .schemaType('article')
              .child(S.documentTypeList('article').title('מאמרים')),
            S.listItem()
              .title('ידיעות חדשות')
              .schemaType('news')
              .child(S.documentTypeList('news').title('ידיעות')),
          ]),
    }),
    visionTool(),
    aiStudio(),
  ],
  schema: {
    types: schemaTypes,
  },
})
