import {article} from './documents/article'
import {news} from './documents/news'
import {aiStudioSettings} from './documents/aiStudioSettings'
import {externalImage} from './objects/externalImage'
import {codeBlock} from './objects/codeBlock'
import {callout} from './objects/callout'
import {tldr} from './objects/tldr'
import {prompt} from './objects/prompt'
import {compareStrip} from './objects/compareStrip'
import {divider} from './objects/divider'

export const schemaTypes = [
  // Documents
  article,
  news,
  aiStudioSettings,
  // Object types referenced inside article.content portable text
  externalImage,
  codeBlock,
  callout,
  tldr,
  prompt,
  compareStrip,
  divider,
]
