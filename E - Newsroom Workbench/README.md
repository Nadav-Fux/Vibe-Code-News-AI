# E — Newsroom Workbench

**Concept:** Newsroom homepage built in the Workbench language. Hero with parallax floating words, **side-by-side Newsroom row** (chat skin-switcher on the right, **🔥 Hot Billboard** on the left), then **The Wall** — every article/guide/comparison is a draggable, expandable post-it, scattered semi-organically, filterable by category. Bottom: a paper-toned **Infinity Canvas** with three marquee streams (categories, article titles, italic quotes) flowing in alternating directions on mustard / sage / sky bands.

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

- **Hero:** "מה חדש היום?" word-by-word drop-in animation; ink pill `• nVision [AI]`; typewriter rotator (וויב קודינג → סוכנים → מודלים → מוצרים → סטארטאפים) with coral caret.
- **Newsroom row** (locked 2-column grid, not stacked): WhatsApp/Telegram/Messenger phone on the right with a real skin switcher; **Hot Billboard** on the left — italic-serif rank numerals, sparklines, ▲▼NEW deltas, flames on top-2.
- **The Wall:** post-its scattered with `position: absolute` and rotation, **fully draggable**, click "+ פתח" to accordion-expand summary + read-more. Filter chips at top dim non-matching notes in place (don't reflow).
- **Infinity Canvas:** paper background with three colored bands (mustard / sage / sky), three marquee streams (LTR / RTL / LTR), enough duplicated items that it never empties. Hover pauses a stream.
- **Palette:** paper #f4f0e8, coral #d65a3a (used sparingly — user dislikes prominent orange), mustard, sage, lavender, sky. No neon, no cyber.
