# StyleFix

A lightweight Windows desktop assistant that fixes selected text and learns your writing style.

## Requirements

- Node.js 18+
- Windows 10/11

## Setup

```bash
npm install
```

## Development

```bash
# One-shot build + run
npm start

# Watch mode (rebuilds TypeScript on change)
npm run dev
```

## Project Structure

```
src/
  main/           # Electron main process (window management, hotkeys, LLM, SQLite)
  preload/        # Secure bridge between main and renderer
  renderer/       # Floating widget UI (HTML/CSS/JS)
  types/          # Shared TypeScript declarations
```

## Build Steps

This project is built incrementally:

1. ✅ Scaffold Electron + TypeScript project
2. ✅ Floating draggable always-on-top widget with states (click widget to test placeholder fix)
3. ✅ Global hotkey (`Ctrl+Shift+F`) + copy selection to clipboard
4. ✅ LLM text fix + paste back
5. SQLite correction storage
6. Style profile learning
7. Settings window
8. Auto-launch + packaging

## Step 3: Hotkey + selection capture

1. Select text in any app (Notepad, browser, Word, etc.)
2. Press **Ctrl+Shift+F**
3. The widget should cycle: Copying… → preview of captured text → `N chars captured`

Clicking the widget runs the same capture flow (uses whatever app currently has focus).

If `uiohook-napi` fails to load, the app falls back to Electron `globalShortcut`.
If simulated copy fails, it falls back to PowerShell `SendKeys`.

### Native module rebuild (optional)

If the hotkey does not work inside Electron, rebuild native modules:

```bash
npm run rebuild
```

This requires Visual Studio Build Tools with a compatible Windows SDK.

## Step 4: LLM fix + paste back

Set your Anthropic API key before testing (settings UI comes in step 7):

```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
npm start
```

1. Select text with typos or awkward phrasing in any app
2. Press **Ctrl+Shift+F**
3. The widget shows Fixing…, then **Fixed** — selected text should be replaced with the correction

Uses Claude (`claude-3-5-haiku-latest` by default) with a plain grammar-fix prompt. Style memory is added in step 6.

## License

MIT
