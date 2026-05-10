# E — Newsroom Workbench

**Concept:** Newsroom homepage built in the Workbench language. Hero with parallax floating words, **side-by-side Newsroom row** (chat skin-switcher on the right, **Hot Billboard** on the left), then **The Wall** — every article/guide/comparison is a draggable, expandable post-it. The new layer adds a full **Article Library** category-page template and a longform **Article Template** for guides, essays, comparisons, and tool reviews. Bottom: a paper-toned **Infinity Canvas** with three marquee streams.

## Run

Open `index.html` (or `E - Newsroom Workbench.html`) in a browser. React + Babel from CDN, no build step.

## Files

| File | Role |
|---|---|
| `index.html` | Entry point — mounts `<VariationFive />`. |
| `E - Newsroom Workbench.html` | Identical copy under the original design name. |
| `v5-styles.css` | All styles (palette, hero typewriter, post-it grid, billboard sparklines, three-stream canvas, skin-switcher chrome). |
| `v5-newsroom.jsx` | Self-contained `VariationFive` component. |

## Implementation notes from the source chat

The E design went through several rounds of feedback — the version in this folder reflects the final state:

- **Hero:** "מה חדש היום?" word-by-word drop-in animation; ink pill `• nVision [AI]`; typewriter rotator (וויב קודינג → סוכנים → מודלים → מוצרים → סטארטאפים) with cobalt caret.
- **Newsroom row:** WhatsApp/Telegram/Messenger phone with a real skin switcher; **Hot Billboard** — italic-serif rank numerals, sparklines, ▲▼NEW deltas, star marker on top-2.
- **The Wall:** post-its scattered with `position: absolute` and rotation, **fully draggable**, click "+ פתח" to accordion-expand summary + read-more. Filter chips at top dim non-matching notes in place (don't reflow).
- **Article Library:** category-page layout with filter chips, editor-pick feature card, chaotic article cards, and reading-track sidebar.
- **Article Template:** longform RTL article shell with TL;DR rail, sticky reading map, hero visual, pullquote, prompt/code card, comparison strip, and related articles.
- **Infinity Canvas:** paper background with three colored bands (mustard / sage / sky), three marquee streams (LTR / RTL / LTR), enough duplicated items that it never empties. Hover pauses a stream.
- **Palette:** paper #f4f0e8, ink, cobalt #3f6df6, sage, sky, lavender, acid-yellow. Orange/coral was removed from the visible language.
