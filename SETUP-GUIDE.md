# StyleFix — Setup & Configuration Guide

This guide explains **what to change** to get StyleFix running: API keys, hotkeys, models, data, builds, and common fixes.

---

## 1. First-time setup (do this first)

### Install dependencies

```powershell
cd C:\path\to\Sidelast
npm install
```

### Run the app

```powershell
npm start
```

### Add your API key (required)

StyleFix supports **Google Gemini (FREE)** and Anthropic.

#### Free option — Google Gemini (recommended)

1. Go to **[aistudio.google.com/apikey](https://aistudio.google.com/apikey)**
2. Sign in with your Google account
3. Click **Create API key** (no credit card needed)
4. Copy the key (starts with `AIza...`)
5. Run StyleFix → **right-click widget** → Settings
6. Provider: **Google Gemini (Free)**
7. Paste your key → **Save settings**

**Option B — Environment variable**

```powershell
$env:GEMINI_API_KEY = "AIza-your-key-here"
npm start
```

#### Paid option — Anthropic

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Create an API key (`sk-ant-...`)
3. In Settings, choose **Anthropic (Paid)** and paste the key

**Option A — Settings UI (recommended)**

1. Run the app (`npm start`)
2. **Right-click** the blue floating widget
3. Choose provider and paste API key
4. Click **Save settings**

---

## 2. API key — what to change

| What | Where to change |
|------|-----------------|
| API key (UI) | Right-click widget → Settings → **Anthropic API key** |
| API key (code fallback) | Env var `ANTHROPIC_API_KEY` or `STYLEFIX_API_KEY` |
| API key storage file | `%APPDATA%\stylefix\stylefix-settings.json` (auto-created) |
| Default model | Settings → **Model** field, or edit default in code (see below) |

### Change the default model in code

File: `src/main/services/settings.ts`

```typescript
defaults: {
  model: 'claude-3-5-haiku-latest',  // ← change this
}
```

Other models you can try:

- `claude-3-5-haiku-latest` — fast, cheap (default)
- `claude-3-5-sonnet-latest` — better quality, slower
- `claude-sonnet-4-20250514` — latest Sonnet (if available on your account)

### Get an Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign in → **API Keys** → **Create Key**
3. Copy the key starting with `sk-ant-`

---

## 3. Hotkey — what to change

| What | Where |
|------|-------|
| Hotkey (UI) | Settings → **Hotkey** section (key + Shift/Alt) |
| Default hotkey in code | `src/shared/hotkey-config.ts` |
| Available keys | `src/shared/hotkey-keys.ts` |

**Default:** `Ctrl+Shift+F`

### Change hotkey in Settings (no code)

1. Right-click widget → Settings
2. Pick a **Key** (F, G, R, E, etc.)
3. Toggle **Shift** / **Alt** (Ctrl is always on)
4. Save settings

### Change default hotkey in code

File: `src/shared/hotkey-config.ts`

```typescript
export const DEFAULT_HOTKEY_KEY: HotkeyKeyOption = 'F';  // ← change key

export const DEFAULT_HOTKEY_MODIFIERS = {
  ctrl: true,
  shift: true,   // ← toggle
  alt: false,    // ← toggle
};
```

---

## 4. Style memory — what to change

| What | Where |
|------|-------|
| Auto-learn on/off | Settings → **Auto-learn from corrections** |
| View/edit profile | Settings → **Learned style profile** textarea |
| Clear all data | Settings → **Clear all learned data** |
| How often profile updates | `src/shared/style-config.ts` → `PROFILE_SUMMARIZE_EVERY` (default: 12) |
| Undo detection window | `src/shared/style-config.ts` → `UNDO_WATCH_MS` (default: 4000 ms) |

### Local data files (privacy)

| Data | Path |
|------|------|
| SQLite database | `%APPDATA%\stylefix\stylefix.db` |
| Settings + API key | `%APPDATA%\stylefix\stylefix-settings.json` |

You can delete these files manually to wipe all local data.

---

## 5. Startup — what to change

| What | Where |
|------|-------|
| Launch at Windows login | Settings → **Launch StyleFix at Windows login** |
| Default (off) | `src/main/services/settings.ts` → `launchAtLogin: false` |

---

## 6. Build & package — steps

### Run in development

```powershell
npm start          # build + run once
npm run dev        # watch mode (auto-rebuild on save)
```

### Build unpacked app (test before installer)

```powershell
npm run pack
```

Output: `release\win-unpacked\StyleFix.exe`

### Build Windows installer

```powershell
# Close StyleFix / Electron first!
Remove-Item -Recurse -Force release -ErrorAction SilentlyContinue
npm run dist
```

Output: `release\StyleFix Setup 1.0.0.exe`

### If hotkey fails in packaged app

Native modules may need a rebuild:

```powershell
npm run rebuild
```

**Important:** Rebuild works best when the project path has **no spaces**.

- Bad: `C:\side last\`
- Good: `C:\dev\Sidelast\`

Also install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) with **Windows SDK**.

---

## 7. Git push — steps

If push fails with `main does not match any`, you need a commit first:

```powershell
git add .
git commit -m "Initial commit: StyleFix v1.0"
git branch -M main
git remote add origin https://github.com/sumangal001/Sidelast.git
git push -u origin main
```

### Sign out of old GitHub account (Control Panel)

1. **Control Panel** → **Credential Manager**
2. **Windows Credentials**
3. Remove `git:https://github.com`
4. Push again — sign in with the correct account

---

## 8. Troubleshooting

| Problem | Fix |
|---------|-----|
| `API key not set` | Add key in Settings or set `ANTHROPIC_API_KEY` env var |
| `No text selected` | Select text first, then press hotkey (keep focus in that app) |
| Hotkey does nothing | Check terminal for `[hotkey] Listening via...`; try `npm run rebuild` |
| `Repository not found` on push | Create repo on GitHub first; check URL and login |
| `main does not match any` | Run `git commit` before `git push` |
| Build fails (SDK error) | Install Windows SDK in Visual Studio Build Tools |
| Build fails (space in path) | Move project to path without spaces |
| `app.asar` file locked | Close StyleFix/Electron, delete `release` folder, retry `npm run dist` |

---

## 9. Key files reference (for developers)

| File | Purpose |
|------|---------|
| `src/main/services/settings.ts` | API key, model, hotkey, auto-learn defaults |
| `src/main/services/llm.ts` | LLM prompts and Anthropic API calls |
| `src/main/services/hotkey.ts` | Global hotkey listener |
| `src/main/services/style-profile.ts` | Style learning logic |
| `src/shared/hotkey-config.ts` | Default hotkey config |
| `src/shared/style-config.ts` | Profile update thresholds |
| `src/renderer/settings/` | Settings window UI |
| `package.json` | Version, build config, dependencies |

---

## 10. Quick checklist before using

- [ ] `npm install` completed
- [ ] Anthropic API key added (Settings or env var)
- [ ] App runs (`npm start`)
- [ ] Blue widget appears on screen
- [ ] Select text in Notepad → `Ctrl+Shift+F` → text gets fixed
- [ ] Right-click widget → Settings opens

Once all checked, StyleFix is ready to use.
