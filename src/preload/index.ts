import { contextBridge, ipcRenderer } from 'electron';
import { IPC, type WidgetStatePayload } from '../shared/ipc';

contextBridge.exposeInMainWorld('stylefix', {
  version: '0.1.0',

  triggerFix: (): Promise<{ ok: boolean; reason?: string }> =>
    ipcRenderer.invoke(IPC.WIDGET_TRIGGER_FIX),

  onStateChange: (callback: (payload: WidgetStatePayload) => void): (() => void) => {
    const handler = (_event: Electron.IpcRendererEvent, payload: WidgetStatePayload) => {
      callback(payload);
    };
    ipcRenderer.on(IPC.WIDGET_STATE, handler);
    return () => ipcRenderer.removeListener(IPC.WIDGET_STATE, handler);
  },
});
