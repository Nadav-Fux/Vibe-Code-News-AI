# C — Newsroom Chat

**Concept:** *The newsroom IS the WhatsApp channel.* A full-bleed phone frame is the page. Articles, leaderboards, prompts — all rendered as messages in a real, scrollable chat. WhatsApp green (#25D366) is the only accent. Brutalist editorial typography (Heebo Black + JetBrains Mono).

## Run

Open `index.html` (or the equivalent `C - Newsroom Chat.html`) in a browser. The page bootstraps React + Babel from CDN, no build step required.

## Files

| File | Role |
|---|---|
| `index.html` | Entry point — loads CDN scripts, mounts `<VariationThree />` into `#root`. |
| `C - Newsroom Chat.html` | Identical copy under the original design name. |
| `styles.css` | Shared design-system base (typography, palette, cursor, marquee, magnetic buttons). |
| `v3-styles.css` | Variation-C-specific styles (phone frame, chat bubbles, brutalist grid). |
| `shared.jsx` | Shared data (`TICKER_MESSAGES`, `ARTICLES`, `LEADERBOARD`, `TRENDING_PROMPTS`, `TOOLS_SHOWCASE`, `CATEGORIES`) and shared hooks/components (`useTicker`, `CustomCursor`, `useMagnetic`, `ScrambleText`, `useReveal`). |
| `v3-newsroom.jsx` | The `VariationThree` component itself. |

## Implementation notes from the source chats

- The page exists because A and B (other variations) felt too "widget-on-a-website." The user wanted the chat to *be* the product — phone frame center stage, messages carry every article/leaderboard/prompt.
- WhatsApp green is the only accent on purpose. No coral, no gradients, no neon, no cyber.
- Skin switcher (WhatsApp / Telegram / Messenger) lives on the phone, not as a side panel.
- Hebrew-primary, English secondary; mixed `Heebo` + `Instrument Serif` italic + `JetBrains Mono`.
