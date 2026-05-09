# A — Bento Editorial

**Concept:** Warm editorial homepage. Cream/bone (`#f4f1ea`) base, deep ink (`#0e0e0c`) type, soft coral/terracotta accent, muted lavender tags. Asymmetric bento grid; modern editorial typography (Heebo + Instrument Serif italic + JetBrains Mono). The WhatsApp/Telegram/Messenger live channel sits as a side panel — articles take center stage in mixed-size bento tiles.

## Run

Open `index.html` (or `A - Bento Editorial.html`) in a browser. React + Babel + fonts load from CDN, no build step.

## Files

| File | Role |
|---|---|
| `index.html` | Entry point — mounts `<VariationOne />`. |
| `A - Bento Editorial.html` | Identical copy under the original design name. |
| `styles.css` | Shared design-system base (typography, palette, custom cursor, magnetic buttons, marquee, reveal). |
| `shared.jsx` | Shared data + hooks (`TICKER_MESSAGES`, `ARTICLES`, `LEADERBOARD`, `TRENDING_PROMPTS`, `TOOLS_SHOWCASE`, `CATEGORIES`, `useTicker`, `CustomCursor`, `useMagnetic`, `ScrambleText`, `useReveal`). |
| `chat-panel.jsx` | Skin-switchable chat widget (WhatsApp / Telegram / Messenger) with typing indicator + auto-incoming flashes. |
| `v1-editorial.jsx` | The `VariationOne` component — bento grid layout, hero, articles, leaderboard, tools showcase, CTA, footer. |

## Implementation notes from the source chat

- "Editorial-meets-OS-window" — hairline borders, generous whitespace, asymmetric grid.
- Coral/terracotta is the warm accent here (B uses electric blue instead).
- Custom cursor with labels, magnetic buttons, hover reveals, scroll-triggered animations, marquee tickers, scramble text — all the wow moments are wired in `shared.jsx` and consumed by `v1-editorial.jsx`.
- Hebrew-primary, English secondary; mixed `Heebo` + `Instrument Serif` italic + `JetBrains Mono`.
