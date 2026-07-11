import { globalShortcut } from 'electron';
import { uIOhook, UiohookKey } from 'uiohook-napi';
import { DEFAULT_HOTKEY } from '../../shared/hotkey-config';

type HotkeyCallback = () => void;

let mode: 'uiohook' | 'globalShortcut' | null = null;
let lastTriggerAt = 0;
const DEBOUNCE_MS = 600;

function shouldTrigger(): boolean {
  const now = Date.now();
  if (now - lastTriggerAt < DEBOUNCE_MS) {
    return false;
  }
  lastTriggerAt = now;
  return true;
}

export function startHotkeyListener(callback: HotkeyCallback): void {
  try {
    uIOhook.on('keydown', (event) => {
      if (
        event.ctrlKey &&
        event.shiftKey &&
        event.keycode === UiohookKey.F &&
        shouldTrigger()
      ) {
        callback();
      }
    });
    uIOhook.start();
    mode = 'uiohook';
    console.log(`[hotkey] Listening via uiohook-napi (${DEFAULT_HOTKEY.label})`);
    return;
  } catch (error) {
    console.warn('[hotkey] uiohook unavailable, falling back to globalShortcut', error);
  }

  const registered = globalShortcut.register(DEFAULT_HOTKEY.accelerator, () => {
    if (shouldTrigger()) {
      callback();
    }
  });

  if (registered) {
    mode = 'globalShortcut';
    console.log(`[hotkey] Listening via globalShortcut (${DEFAULT_HOTKEY.label})`);
  } else {
    console.error('[hotkey] Failed to register global hotkey');
  }
}

export function stopHotkeyListener(): void {
  if (mode === 'uiohook') {
    try {
      uIOhook.stop();
    } catch (error) {
      console.warn('[hotkey] Failed to stop uiohook', error);
    }
  } else if (mode === 'globalShortcut') {
    globalShortcut.unregister(DEFAULT_HOTKEY.accelerator);
  }

  mode = null;
}
