import { app, BrowserWindow, ipcMain } from 'electron';
import { closeDatabase, initDatabase } from './db/database';
import { ensureProfileRow } from './db/profile';
import { IPC } from '../shared/ipc';
import { runFixSession, isFixInProgress } from './fix-controller';
import {
  shutdownInputHook,
  startHotkeyListener,
} from './services/hotkey';
import { syncLaunchAtLoginFromStore } from './services/settings';
import { registerSettingsHandlers } from './settings-handlers';
import { stopUndoWatch } from './services/undo-watcher';
import { createWidgetWindow } from './widget-manager';

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
}

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
  syncLaunchAtLoginFromStore();
  registerIpcHandlers();
  registerSettingsHandlers();
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
  shutdownInputHook();
  closeDatabase();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
