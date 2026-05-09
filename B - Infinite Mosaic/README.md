# B — Infinite Mosaic

**Concept:** Stone/cream base with electric-blue accent. Mosaic of tiles at gentle rotations, fluid-blob shader-style background, infinite-canvas feel. Same design system as A (Heebo + Instrument Serif italic + JetBrains Mono, custom cursor, magnetic buttons), different mood — cooler palette, more spatial, tiles can drift and overlap.

## Run

Open `index.html` (or `B - Infinite Mosaic.html`) in a browser. React + Babel + fonts load from CDN, no build step.

## Files

| File | Role |
|---|---|
| `index.html` | Entry point — mounts `<VariationTwo />`. |
| `B - Infinite Mosaic.html` | Identical copy under the original design name. |
| `styles.css` | Shared design-system base. |
| `shared.jsx` | Shared data + hooks/components (see A's README for the symbol list). |
| `chat-panel.jsx` | Skin-switchable chat widget (WhatsApp / Telegram / Messenger). |
| `v2-canvas.jsx` | The `VariationTwo` component — mosaic tile layout, blob background, parallax, infinite-canvas treatment. |

## Implementation notes from the source chat

- Cream/stone base + electric-blue accent (deliberately different from A's coral, so the two variations feel distinct on the same canvas).
- Tiles sit at small rotation angles and have fluid blobs behind them — the spatial / shader-y feel is what makes B "infinite mosaic" instead of "bento."
- Same wow toolkit as A: custom cursor, magnetic buttons, hover reveals, marquee tickers, scramble text, scroll-triggered reveals — all sourced from `shared.jsx`.
- Hebrew-primary RTL, mixed-typeface treatment; no neon, no gradients, no cyberpunk (per the user's original brief).
