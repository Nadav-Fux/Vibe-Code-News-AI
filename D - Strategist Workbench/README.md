# D — Strategist Workbench

**Concept:** *The Strategist's Desk.* A chaotic, gridless creative brainstorm with a clean Browser-Mockup "portal" as the order in the chaos. Draggable post-its (yellow / cyan / magenta / green), wireframe scraps, JetBrains-Mono code snippets, and floating background keywords (CONVERSION, UX, SCALABILITY, vibe, retention) at random angles with parallax depth.

## Run

Open `index.html` (or `D - Strategist Workbench.html`) in a browser. React + Babel from CDN, no build step.

## Files

| File | Role |
|---|---|
| `index.html` | Entry point — mounts `<VariationFour />`. |
| `D - Strategist Workbench.html` | Identical copy under the original design name. |
| `v4-styles.css` | All styles for the desk (paper texture, post-it shadows, browser-mockup chrome, keyword parallax layer). |
| `v4-workbench.jsx` | Self-contained `VariationFour` component (drag handlers, parallax scroll, hover-reveal post-its, "CLEAN UP DESK" action). |

## Implementation notes from the source chat

- Stays in the nVision design system (paper / ink / WhatsApp-green palette, same fonts) so it can sit alongside the news pages without looking foreign.
- Vanilla pointer events, not Framer Motion — keeps the no-build CDN stack consistent across all five variations.
- The center "Browser Mockup" is the order: a polished case study (10w / 3.1× conversion / Lighthouse 99). Everything around it is intentional mess.
- Hover on a post-it scales it up and reveals a phase description ("Phase 1: Deep Research", etc.).
- Background keywords scroll *faster* than foreground notes (inverse parallax) — it's the gag.
