import { ipcMain } from 'electron';
import { clearAllLearnedData } from './db/clear-data';
import { restartHotkeyListener } from './services/hotkey';
import {
  getSettingsSnapshot,
  saveSettings,
} from './services/settings';
import { openSettingsWindow } from './settings-window';
import { IPC } from '../shared/ipc';
import type { SettingsSavePayload } from '../shared/settings-types';

export function registerSettingsHandlers(): void {
  ipcMain.handle(IPC.SETTINGS_GET, () => getSettingsSnapshot());

  ipcMain.handle(IPC.SETTINGS_SAVE, (_event, payload: SettingsSavePayload) => {
    try {
      const snapshot = saveSettings(payload);
      restartHotkeyListener();
      return { ok: true as const, snapshot };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to save settings';
      return { ok: false as const, error: message };
    }
  });

  ipcMain.handle(IPC.SETTINGS_CLEAR_DATA, () => {
    clearAllLearnedData();
    return getSettingsSnapshot();
  });

  ipcMain.on(IPC.SETTINGS_OPEN, () => {
    openSettingsWindow();
  });
}
