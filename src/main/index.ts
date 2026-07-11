import { app, BrowserWindow, ipcMain } from 'electron';
import { closeDatabase, initDatabase } from './db/database';
import { ensureProfileRow } from './db/profile';
import { IPC } from '../shared/ipc';
import { runFixSession, isFixInProgress } from './fix-controller';
import { startHotkeyListener, stopHotkeyListener } from './services/hotkey';
import { stopUndoWatch } from './services/undo-watcher';
import { createWidgetWindow } from './widget-manager';

function registerIpcHandlers(): void {
  ipcMain.handle(IPC.WIDGET_TRIGGER_FIX, async () => {
    if (isFixInProgress()) {
      return { ok: false, reason: 'busy' };
    }
    void runFixSession();
    return { ok: true };
  });
}

app.whenReady().then(() => {
  initDatabase();
  ensureProfileRow();
  registerIpcHandlers();
  createWidgetWindow();
  startHotkeyListener(() => {
    void runFixSession();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWidgetWindow();
    }
  });
});

app.on('will-quit', () => {
  stopUndoWatch();
  stopHotkeyListener();
  closeDatabase();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
