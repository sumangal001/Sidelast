import { BrowserWindow } from 'electron';
import path from 'path';

let settingsWindow: BrowserWindow | null = null;

export function openSettingsWindow(): void {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 720,
    minWidth: 420,
    minHeight: 600,
    title: 'StyleFix Settings',
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  settingsWindow.loadFile(
    path.join(__dirname, '../../src/renderer/settings/index.html')
  );

  settingsWindow.on('closed', () => {
    settingsWindow = null;
  });
}
