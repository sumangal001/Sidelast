import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { IPC, type WidgetStatePayload } from '../shared/ipc';
import {
  WIDGET_SIZE,
  WIDGET_STATE_META,
  type WidgetState,
} from '../shared/widget-state';

let widgetWindow: BrowserWindow | null = null;
let currentState: WidgetState = 'idle';
let fixInProgress = false;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function sendWidgetState(state: WidgetState, message?: string): void {
  currentState = state;
  const meta = WIDGET_STATE_META[state];
  const size = meta.expanded ? WIDGET_SIZE.expanded : WIDGET_SIZE.compact;

  if (widgetWindow && !widgetWindow.isDestroyed()) {
    widgetWindow.setSize(size.width, size.height, true);
    const payload: WidgetStatePayload = { state, message };
    widgetWindow.webContents.send(IPC.WIDGET_STATE, payload);
  }
}

async function runPlaceholderFix(): Promise<void> {
  if (fixInProgress) return;
  fixInProgress = true;

  try {
    sendWidgetState('listening');
    await delay(400);

    sendWidgetState('fixing');
    await delay(1500);

    sendWidgetState('fixed');
    await delay(1200);
  } catch {
    sendWidgetState('error', 'Fix failed');
    await delay(2000);
  } finally {
    sendWidgetState('idle');
    fixInProgress = false;
  }
}

function createWidgetWindow(): void {
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
}

function registerIpcHandlers(): void {
  ipcMain.handle(IPC.WIDGET_TRIGGER_FIX, async () => {
    if (fixInProgress) return { ok: false, reason: 'busy' };
    void runPlaceholderFix();
    return { ok: true };
  });
}

app.whenReady().then(() => {
  registerIpcHandlers();
  createWidgetWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWidgetWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
