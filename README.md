# Vibe Code News AI

Five UI variations for the nVision AI newsroom. Live at **[new.nvision.me](https://new.nvision.me)**.

A wrapper page (`index.html`) at the root mounts each variation in an iframe with a tab bar across the top. Default is **E**; switch with the tabs or keyboard shortcuts <kbd>A</kbd> / <kbd>B</kbd> / <kbd>C</kbd> / <kbd>D</kbd> / <kbd>E</kbd>.

## Variations

| | Name | Folder |
|---|---|---|
| A | Bento Editorial | `A - Bento Editorial/` |
| B | Infinite Mosaic | `B - Infinite Mosaic/` |
| C | Newsroom Chat | `C - Newsroom Chat/` |
| D | Strategist Workbench | `D - Strategist Workbench/` |
| E | Newsroom Workbench | `E - Newsroom Workbench/` *(default)* |

Each folder is self-contained: HTML + JSX (rendered in-browser via Babel standalone) + CSS.

## Local preview

```powershell
python -m http.server 8000
# open http://localhost:8000/
```
