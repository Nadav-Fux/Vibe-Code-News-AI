#!/usr/bin/env node
// Phase Telegram-C — historical import from Telegram Desktop JSON export.
//
// USAGE:
//
//   1. In Telegram Desktop (PC/Mac, NOT mobile):
//      Settings → Advanced → Export Telegram Data
//        - Source: your channel
//        - Format: Machine-readable JSON
//        - Content: tick "Personal chats" or "Channels" (whichever your channel is)
//        - Date range: optional, defaults to all-time
//      Click "Export" → wait → "Show in folder" → find `result.json`.
//
//   2. Run:
//
//      $env:SANITY_PROJECT_ID="edmzm8yr"
//      $env:SANITY_DATASET="production"
//      $env:SANITY_WRITE_TOKEN="<your-editor-token-from-sanity.io/manage>"
//      node scripts/telegram-import.js path/to/result.json [--dry-run] [--limit N]
//
//   On macOS/Linux:
//      SANITY_PROJECT_ID=edmzm8yr \
//      SANITY_DATASET=production \
//      SANITY_WRITE_TOKEN=... \
//      node scripts/telegram-import.js result.json
//
// WHY NOT USE THE BOT API?
//
//   Telegram's Bot API cannot read channel history — bots only see messages
//   posted AFTER they were added as channel admins. For one-time backfill,
//   the Desktop client's export is the only first-party path that doesn't
//   require MTProto (User API) credentials.
//
// IDEMPOTENCY:
//
//   Each Telegram message is imported with slug `tg-import-{message.id}` and
//   _id `drafts.tg-import-{message.id}`. Re-running the script upserts
//   existing drafts — safe to run multiple times. Drafts won't appear on the
//   public site until you promote them to published via /admin/news.html.
//
// FILTERING:
//
//   We skip: empty/whitespace-only messages, service messages, polls,
//   stickers, and messages where text length < 8 chars. Photos/videos with
//   captions are imported using the caption text as the body.

const fs = require('node:fs');
const path = require('node:path');

const REQUIRED_ENV = ['SANITY_PROJECT_ID', 'SANITY_DATASET', 'SANITY_WRITE_TOKEN'];
const API_VERSION = process.env.SANITY_API_VERSION || '2024-01-01';

// ---- arg parsing ----
const args = process.argv.slice(2);
if (!args.length || args.includes('--help') || args.includes('-h')) {
  console.log(fs.readFileSync(__filename, 'utf8').split('\n').filter(l => l.startsWith('//')).slice(0, 38).join('\n'));
  process.exit(0);
}
const filePath = args.find((a) => !a.startsWith('--'));
if (!filePath) {
  console.error('Missing path argument. Usage: node scripts/telegram-import.js path/to/result.json');
  process.exit(1);
}
const dryRun = args.includes('--dry-run');
const limitIdx = args.indexOf('--limit');
const limit = limitIdx >= 0 ? parseInt(args[limitIdx + 1], 10) : Infinity;

// ---- env check ----
for (const k of REQUIRED_ENV) {
  if (!process.env[k]) {
    console.error(`Missing env var: ${k}`);
    process.exit(1);
  }
}
const projectId = process.env.SANITY_PROJECT_ID;
const dataset = process.env.SANITY_DATASET;
const token = process.env.SANITY_WRITE_TOKEN;

// ---- load + parse JSON ----
const fullPath = path.resolve(filePath);
if (!fs.existsSync(fullPath)) {
  console.error(`File not found: ${fullPath}`);
  process.exit(1);
}
const exportData = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
const messages = Array.isArray(exportData.messages) ? exportData.messages : [];
console.log(`Loaded ${messages.length} messages from ${path.basename(fullPath)}`);

// ---- helpers ----

// Telegram's JSON export represents text as either a plain string OR an array
// of {type, text} segments (when there are entities like bold, links, etc.).
function flattenText(text) {
  if (typeof text === 'string') return text;
  if (!Array.isArray(text)) return '';
  return text.map((seg) => {
    if (typeof seg === 'string') return seg;
    if (seg && typeof seg.text === 'string') return seg.text;
    return '';
  }).join('').trim();
}

function detectUrgency(text) {
  if (/⚡|🚨|breaking|מבזק|פריצת דרך/i.test(text)) return 'breaking';
  if (/🔥|דחוף|חשוב/i.test(text)) return 'high';
  return 'normal';
}

function detectCategory(text) {
  if (/release|השק|הוצא|launches/i.test(text)) return 'release';
  if (/analysis|ניתוח|בדיקה/i.test(text)) return 'analysis';
  if (/rumor|שמועה|טוענים|מדברים על/i.test(text)) return 'rumor';
  if (/מדריך|guide|how to|איך/i.test(text)) return 'guide-short';
  if (/breaking|מבזק|דחוף/i.test(text)) return 'breaking';
  return 'update';
}

function extractFirstUrl(text) {
  const m = (text || '').match(/https?:\/\/[^\s)]+/);
  return m ? m[0] : '';
}

function buildDraftFromMessage(m) {
  const text = flattenText(m.text);
  if (!text || text.length < 8) return null;
  if (/^\/[a-z]/i.test(text)) return null; // skip commands
  if (m.type && m.type !== 'message') return null; // skip service messages

  const lines = text.split(/\n+/).map((s) => s.trim()).filter(Boolean);
  const headline = (lines[0] || 'ידיעה').slice(0, 140);
  let dek = '';
  let bodyStart = 1;
  if (lines.length >= 2 && lines[0].length <= 140) {
    dek = lines[1].slice(0, 280);
    bodyStart = 2;
  }
  if (!dek) dek = headline.slice(0, 280);
  const body = lines.slice(bodyStart).join('\n\n').slice(0, 2400) || dek;

  const id = String(m.id);
  return {
    _id: 'drafts.tg-import-' + id,
    _type: 'news',
    headline,
    dek,
    body,
    slug: { _type: 'slug', current: 'tg-import-' + id },
    category: detectCategory(text),
    urgency: detectUrgency(text),
    channels: ['telegram-source'],
    source: 'Telegram (historical import)',
    sourceUrl: extractFirstUrl(text),
    heroImage: '',
    status: 'draft',
    publishedAt: m.date || new Date().toISOString(),
  };
}

async function sanityMutate(mutations) {
  const url = `https://${projectId}.api.sanity.io/v${API_VERSION}/data/mutate/${dataset}?returnIds=true`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ mutations }),
  });
  const body = await r.text();
  if (!r.ok) throw new Error(`Sanity ${r.status}: ${body.slice(0, 240)}`);
  return JSON.parse(body);
}

// ---- main ----
async function main() {
  let imported = 0;
  let skipped = 0;
  let failed = 0;
  const batchSize = 25; // Sanity allows large mutation batches; 25 keeps payload small
  let batch = [];

  for (const m of messages) {
    if (imported >= limit) break;
    const doc = buildDraftFromMessage(m);
    if (!doc) {
      skipped++;
      continue;
    }
    batch.push({ createOrReplace: doc });
    if (batch.length >= batchSize) {
      try {
        if (dryRun) {
          console.log(`[dry-run] would import batch of ${batch.length}`);
        } else {
          await sanityMutate(batch);
        }
        imported += batch.length;
        process.stdout.write(`\r→ imported ${imported}, skipped ${skipped}, failed ${failed}`);
      } catch (e) {
        failed += batch.length;
        console.error(`\nBatch failed:`, e.message);
      }
      batch = [];
    }
  }
  if (batch.length) {
    try {
      if (dryRun) console.log(`[dry-run] would import final batch of ${batch.length}`);
      else await sanityMutate(batch);
      imported += batch.length;
    } catch (e) {
      failed += batch.length;
      console.error(`\nFinal batch failed:`, e.message);
    }
  }

  console.log(`\n\n${dryRun ? '[DRY RUN] ' : ''}Done.`);
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped} (empty, commands, service messages)`);
  console.log(`Failed:   ${failed}`);
  console.log(`\nDrafts created with _id drafts.tg-import-<message_id>.`);
  console.log(`Review and promote at /admin/news.html (filter by channels='telegram-source').`);
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
