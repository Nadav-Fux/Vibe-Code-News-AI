#!/usr/bin/env node
/**
 * inject-env.js — Replaces Sanity placeholder tokens in JSX files
 * with values from .env.local / environment variables at build time.
 *
 * Usage: node .github/scripts/inject-env.js
 *
 * SECURITY: Only files matching V5_* placeholder patterns are modified.
 *           No .env values are logged or exposed.
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env.local') });

// Only public-safe values are injected into the static bundle.
// SANITY_WRITE_TOKEN must NEVER be injected — it lives only in the Cloudflare
// Pages Function env vars and is used server-side in functions/api/*.js.
const PLACEHOLDERS = {
  '__SANITY_PROJECT_ID__':     process.env.SANITY_PROJECT_ID     || '',
  '__SANITY_DATASET__':        process.env.SANITY_DATASET        || 'production',
  '__SANITY_API_VERSION__':    process.env.SANITY_API_VERSION    || '2024-01-01',
  '__SANITY_READ_TOKEN__':     process.env.SANITY_API_READ_TOKEN || '',
};

// Guard against accidentally running the inject script locally with a populated
// .env.local — that would write real values into the source file.
if (!process.env.CI && !process.env.FORCE_INJECT) {
  console.error('❌ inject-env.js refused to run: CI env var not set. Run inside GitHub Actions, or set FORCE_INJECT=1 to override.');
  process.exit(1);
}

// Target files — only the JSX source files that contain placeholders
const TARGET_DIR = path.resolve(__dirname, '..', '..', 'E - Newsroom Workbench');
const TARGET_FILES = ['v5-newsroom.jsx'];

let replaced = 0;
let total = 0;

TARGET_FILES.forEach((file) => {
  const filePath = path.join(TARGET_DIR, file);
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${filePath} — skipping`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf-8');
  const original = content;

  Object.entries(PLACEHOLDERS).forEach(([placeholder, value]) => {
    // Escape for regex
    const escaped = placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = content.match(regex);
    if (matches) {
      total += matches.length;
      content = content.replace(regex, value);
    }
  });

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf-8');
    replaced++;
    console.log(`✅ Injected env into ${file}`);
  } else {
    console.log(`⏭️  No placeholders found in ${file}`);
  }
});

// Restore original file for git (write a .gitattributes smudge filter approach is overkill;
// instead we restore immediately after so only the deployed copy has real values)
// NOTE: We DON'T restore — the workflow checks out clean code, runs this, deploys,
// and the checkout is ephemeral. The real source files keep their placeholders.

console.log(`\n📊 ${replaced} file(s) updated, ${total} placeholder(s) replaced.`);
if (total === 0) {
  console.warn('⚠️  No placeholders were found — make sure the JSX files contain __SANITY_*__ tokens.');
}