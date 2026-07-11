import { BrowserWindow } from 'electron';
import path from 'path';

let composerWindow: BrowserWindow | null = null;

export function openComposerWindow(): void {
  if (composerWindow && !composerWindow.isDestroyed()) {
    composerWindow.focus();
    return;
  }

  composerWindow = new BrowserWindow({
    width: 420,
    height: 520,
    minWidth: 360,
    minHeight: 420,
    title: 'StyleFix — Type to fix',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  composerWindow.loadFile(
    path.join(__dirname, '../../src/renderer/composer/index.html')
  );

  composerWindow.on('closed', () => {
    composerWindow = null;
  });
}
