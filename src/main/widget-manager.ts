import { BrowserWindow } from 'electron';
import path from 'path';
import { IPC, type WidgetStatePayload } from '../shared/ipc';
import {
  WIDGET_SIZE,
  WIDGET_STATE_META,
  type WidgetState,
} from '../shared/widget-state';

let widgetWindow: BrowserWindow | null = null;

export function createWidgetWindow(): BrowserWindow {
  widgetWindow = new BrowserWindow({
    width: WIDGET_SIZE.compact.width,
    height: WIDGET_SIZE.compact.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  widgetWindow.loadFile(
    path.join(__dirname, '../../src/renderer/widget/index.html')
  );

  widgetWindow.webContents.on('did-finish-load', () => {
    sendWidgetState('idle');
  });

  widgetWindow.on('closed', () => {
    widgetWindow = null;
  });

  return widgetWindow;
}

export function sendWidgetState(state: WidgetState, message?: string): void {
  const meta = WIDGET_STATE_META[state];
  const size = meta.expanded ? WIDGET_SIZE.expanded : WIDGET_SIZE.compact;

  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.setSize(size.width, size.height, true);
    const payload: WidgetStatePayload = { state, message };
    widgetWindow.webContents.send(IPC.WIDGET_STATE, payload);
  }
}
