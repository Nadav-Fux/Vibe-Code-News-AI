/**
 * Document action: "✨ סדר עם AI"
 *
 * Opens a dialog with a raw-text textarea + optional editor instruction,
 * POSTs to /api/ai-format on the production site, then patches the
 * currently-open document with the structured result.
 *
 * Scoped to `news` and `article` types via plugins/aiStudio/index.ts.
 */
import {useCallback, useEffect, useMemo, useState} from 'react'
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Spinner,
  Stack,
  Text,
  TextArea,
  TextInput,
  useToast,
} from '@sanity/ui'
import {useClient, useDocumentOperation, type DocumentActionComponent} from 'sanity'

const AI_ENDPOINT = 'https://new.nvision.me/api/ai-format'
const SECRET_STORAGE_KEY = 'v5_editor_secret'

type Mode = 'news' | 'article'

interface NewsData {
  headline: string
  slug: string
  dek: string
  body: string
  category: string
  urgency: string
  channels?: string[]
}

interface ArticleSection {
  heading: string
  body: string
}

interface ArticleData {
  title: string
  slug: string
  lead: string
  sections: ArticleSection[]
  takeaways?: string[]
}

interface AiResponse {
  ok: boolean
  mode: Mode
  provider?: string
  data: NewsData | ArticleData
  error?: string
}

// ---------- helpers ----------

let keyCounter = 0
function shortKey(prefix = 'k') {
  keyCounter += 1
  // Sanity keys must be unique within an array; date+counter is plenty.
  return `${prefix}_${Date.now().toString(36)}_${keyCounter.toString(36)}`
}

function makeBlock(text: string, style: 'normal' | 'h2' = 'normal') {
  return {
    _type: 'block',
    _key: shortKey('blk'),
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: shortKey('sp'),
        text: text || '',
        marks: [],
      },
    ],
  }
}

function buildArticleBody(data: ArticleData) {
  const blocks: ReturnType<typeof makeBlock>[] = []
  if (data.lead && data.lead.trim()) {
    // Split lead on blank lines so multi-paragraph leads stay readable.
    data.lead
      .split(/\n{2,}/)
      .map((p) => p.trim())
      .filter(Boolean)
      .forEach((p) => blocks.push(makeBlock(p, 'normal')))
  }
  for (const section of data.sections || []) {
    if (section.heading && section.heading.trim()) {
      blocks.push(makeBlock(section.heading.trim(), 'h2'))
    }
    if (section.body && section.body.trim()) {
      section.body
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter(Boolean)
        .forEach((p) => blocks.push(makeBlock(p, 'normal')))
    }
  }
  if (Array.isArray(data.takeaways) && data.takeaways.length) {
    blocks.push(makeBlock('עיקרי דברים', 'h2'))
    data.takeaways
      .map((t) => (t || '').trim())
      .filter(Boolean)
      .forEach((t) => blocks.push(makeBlock(`• ${t}`, 'normal')))
  }
  return blocks
}

function getEditorSecret(): string {
  try {
    const cached =
      typeof window !== 'undefined' ? window.localStorage.getItem(SECRET_STORAGE_KEY) : null
    if (cached && cached.trim()) return cached.trim()
  } catch {
    /* localStorage might be unavailable */
  }
  const prompted =
    typeof window !== 'undefined'
      ? window.prompt('הזן Editor Secret (יישמר לוקלית ב-localStorage)')
      : null
  if (prompted && prompted.trim()) {
    try {
      window.localStorage.setItem(SECRET_STORAGE_KEY, prompted.trim())
    } catch {
      /* ignore */
    }
    return prompted.trim()
  }
  return ''
}

// ---------- action component ----------

export const aiFormatAction: DocumentActionComponent = (props) => {
  const {id, type, draft, published, onComplete} = props
  const isSupported = type === 'news' || type === 'article'
  const mode: Mode = type === 'article' ? 'article' : 'news'

  const [open, setOpen] = useState(false)
  const [rawText, setRawText] = useState('')
  const [instructions, setInstructions] = useState('')
  const [busy, setBusy] = useState(false)

  const toast = useToast()
  const client = useClient({apiVersion: '2024-01-01'})
  const {patch} = useDocumentOperation(id, type)

  // Seed instructions from doc.aiInstructions if present (article only).
  useEffect(() => {
    if (!open) return
    const docValue = (draft ?? published) as Record<string, unknown> | null
    if (mode === 'article' && docValue && typeof docValue.aiInstructions === 'string') {
      setInstructions((current) => current || (docValue.aiInstructions as string))
    }
  }, [open, draft, published, mode])

  const handleClose = useCallback(() => {
    if (busy) return
    setOpen(false)
    setRawText('')
    setInstructions('')
    onComplete()
  }, [busy, onComplete])

  const handleSubmit = useCallback(async () => {
    const text = rawText.trim()
    if (text.length < 20) {
      toast.push({status: 'warning', title: 'יש להזין לפחות 20 תווים של טקסט גולמי'})
      return
    }
    const secret = getEditorSecret()
    if (!secret) {
      toast.push({status: 'error', title: 'אין Editor Secret — הפעולה בוטלה'})
      return
    }

    setBusy(true)
    try {
      const resp = await fetch(AI_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Editor-Secret': secret,
        },
        body: JSON.stringify({rawText: text, mode, instructions: instructions.trim() || undefined}),
      })
      const bodyText = await resp.text()
      let parsed: AiResponse | null = null
      try {
        parsed = bodyText ? (JSON.parse(bodyText) as AiResponse) : null
      } catch {
        parsed = null
      }

      if (!resp.ok || !parsed || !parsed.ok) {
        const msg =
          (parsed && (parsed.error || (parsed as {message?: string}).message)) ||
          `שגיאת AI (${resp.status})`
        throw new Error(String(msg))
      }

      if (mode === 'news') {
        const d = parsed.data as NewsData
        patch.execute([
          {
            set: {
              headline: d.headline,
              dek: d.dek,
              body: d.body,
              category: d.category,
              urgency: d.urgency,
              slug: {_type: 'slug', current: d.slug},
            },
          },
        ])
      } else {
        const d = parsed.data as ArticleData
        const blocks = buildArticleBody(d)
        // Replace content[] wholesale. Use the client for the array
        // mutation because useDocumentOperation's patch.execute serializes
        // array sets identically — both work, but the client gives an
        // explicit promise we can await for a clean toast lifecycle.
        await client
          .patch(id)
          .set({
            title: d.title,
            slug: {_type: 'slug', current: d.slug},
            content: blocks,
          })
          .commit({autoGenerateArrayKeys: true})
      }

      toast.push({
        status: 'success',
        title: 'AI סידר את הטקסט',
        description: `מצב: ${mode} · ספק: ${parsed.provider || 'unknown'}`,
      })
      setOpen(false)
      setRawText('')
      setInstructions('')
      onComplete()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'שגיאה לא ידועה'
      toast.push({status: 'error', title: 'AI נכשל', description: message})
    } finally {
      setBusy(false)
    }
  }, [rawText, instructions, mode, toast, patch, client, id, onComplete])

  const dialog = useMemo(() => {
    if (!open) return null
    return (
      <Dialog
        id="ai-format-dialog"
        header={mode === 'news' ? '✨ סדר ידיעה עם AI' : '✨ סדר מאמר עם AI'}
        onClose={handleClose}
        width={1}
        zOffset={1000}
      >
        <Box padding={4}>
          <Stack space={4}>
            <Card padding={3} radius={2} tone="primary">
              <Text size={1}>
                הדבק טקסט גולמי (הערות, תמלול, ניוזלטר...) ו-AI יסדר אותו למבנה{' '}
                {mode === 'news' ? 'ידיעה' : 'מאמר'}. התוצאה תוחל ישירות על המסמך הפתוח.
              </Text>
            </Card>

            <Stack space={2}>
              <Text size={1} weight="semibold">
                טקסט גולמי לעיבוד
              </Text>
              <TextArea
                value={rawText}
                onChange={(e) => setRawText(e.currentTarget.value)}
                rows={10}
                disabled={busy}
                placeholder="הדבק כאן את הטקסט הגולמי..."
              />
              <Text size={0} muted>
                {rawText.length} / 6000 תווים (מינימום 20)
              </Text>
            </Stack>

            <Stack space={2}>
              <Text size={1} weight="semibold">
                הנחיה לעורך (אופציונלי)
              </Text>
              <TextInput
                value={instructions}
                onChange={(e) => setInstructions(e.currentTarget.value)}
                disabled={busy}
                placeholder="לדוגמה: שמור על טון אנליטי, התמקד בהיבט הטכני"
              />
            </Stack>

            <Flex justify="flex-end" gap={2}>
              <Button text="ביטול" mode="ghost" onClick={handleClose} disabled={busy} />
              <Button
                text={busy ? 'מעבד...' : 'הרץ AI'}
                tone="primary"
                onClick={handleSubmit}
                disabled={busy || rawText.trim().length < 20}
                icon={busy ? Spinner : undefined}
              />
            </Flex>
          </Stack>
        </Box>
      </Dialog>
    )
  }, [open, mode, rawText, instructions, busy, handleClose, handleSubmit])

  if (!isSupported) {
    return null
  }

  return {
    label: busy ? 'מעבד...' : '✨ סדר עם AI',
    disabled: busy,
    onHandle: () => setOpen(true),
    dialog: dialog
      ? {
          type: 'custom' as const,
          component: dialog,
        }
      : undefined,
  }
}
