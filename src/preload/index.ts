import { contextBridge, ipcRenderer } from 'electron';
import { IPC, type WidgetStatePayload } from '../shared/ipc';
import type { SettingsSavePayload, SettingsSnapshot } from '../shared/settings-types';

contextBridge.exposeInMainWorld('stylefix', {
  version: '0.1.0',

  triggerFix: (): Promise<{ ok: boolean; reason?: string }> =>
    ipcRenderer.invoke(IPC.WIDGET_TRIGGER_FIX),

  fixManual: (
    text: string
  ): Promise<{ ok: true; text: string } | { ok: false; error: string }> =>
    ipcRenderer.invoke(IPC.WIDGET_FIX_MANUAL, text),

  pasteResult: (text: string): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke(IPC.WIDGET_PASTE_RESULT, text),

  onStateChange: (callback: (payload: WidgetStatePayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: WidgetStatePayload) => {
      callback(payload);
    };
    ipcRenderer.on(IPC.WIDGET_STATE, handler);
    return () => ipcRenderer.removeListener(IPC.WIDGET_STATE, handler);
  },

  openSettings: (): void => {
    ipcRenderer.send(IPC.SETTINGS_OPEN);
  },

  openComposer: (): void => {
    ipcRenderer.send(IPC.COMPOSER_OPEN);
  },

  getSettings: (): Promise<SettingsSnapshot> =>
    ipcRenderer.invoke(IPC.SETTINGS_GET),

  saveSettings: (
    payload: SettingsSavePayload
  ): Promise<
    | { ok: true; snapshot: SettingsSnapshot }
    | { ok: false; error: string }
  > => ipcRenderer.invoke(IPC.SETTINGS_SAVE, payload),

  clearLearnedData: (): Promise<SettingsSnapshot> =>
    ipcRenderer.invoke(IPC.SETTINGS_CLEAR_DATA),
});
