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
3. Global hotkey + clipboard copy
4. LLM text fix + paste back
5. SQLite correction storage
6. Style profile learning
7. Settings window
8. Auto-launch + packaging

## License

MIT
