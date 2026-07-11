import { globalShortcut } from 'electron';
import { uIOhook, type UiohookKeyboardEvent } from 'uiohook-napi';
import { getHotkeyConfig } from './settings';

type HotkeyCallback = () => void;

let mode: 'uiohook' | 'globalShortcut' | null = null;
let lastTriggerAt = 0;
let onHotkey: HotkeyCallback | null = null;
let keydownHandler: ((event: UiohookKeyboardEvent) => void) | null = null;
let registeredAccelerator: string | null = null;
const DEBOUNCE_MS = 600;

function shouldTrigger(): boolean {
  const now = Date.now();
  if (now - lastTriggerAt < DEBOUNCE_MS) {
    return false;
  }
  lastTriggerAt = now;
  return true;
}

function matchesHotkey(event: UiohookKeyboardEvent): boolean {
  const config = getHotkeyConfig();
  return (
    event.ctrlKey === config.ctrl &&
    event.shiftKey === config.shift &&
    event.altKey === config.alt &&
    event.keycode === config.keyCode
  );
}

function registerUiohookListener(): void {
  if (keydownHandler) {
    uIOhook.off('keydown', keydownHandler);
  }

  keydownHandler = (event) => {
    if (matchesHotkey(event) && shouldTrigger()) {
      onHotkey?.();
    }
  };

  uIOhook.on('keydown', keydownHandler);
}

export function startHotkeyListener(callback: HotkeyCallback): void {
  onHotkey = callback;
  stopHotkeyListener();

  try {
    registerUiohookListener();
    uIOhook.start();
    mode = 'uiohook';
    console.log(
      `[hotkey] Listening via uiohook-napi (${getHotkeyConfig().label})`
    );
    return;
  } catch (error) {
    if (keydownHandler) {
      uIOhook.off('keydown', keydownHandler);
      keydownHandler = null;
    }
    console.warn(
      '[hotkey] uiohook unavailable, falling back to globalShortcut',
      error
    );
  }

  const accelerator = getHotkeyConfig().accelerator;
  const registered = globalShortcut.register(accelerator, () => {
    if (shouldTrigger()) {
      onHotkey?.();
    }
  });

  if (registered) {
    mode = 'globalShortcut';
    registeredAccelerator = accelerator;
    console.log(
      `[hotkey] Listening via globalShortcut (${getHotkeyConfig().label})`
    );
  } else {
    console.error('[hotkey] Failed to register global hotkey');
  }
}

export function restartHotkeyListener(): void {
  if (!onHotkey) {
    return;
  }
  startHotkeyListener(onHotkey);
}

export function stopHotkeyListener(): void {
  if (keydownHandler) {
    uIOhook.off('keydown', keydownHandler);
    keydownHandler = null;
  }

  if (mode === 'globalShortcut' && registeredAccelerator) {
    globalShortcut.unregister(registeredAccelerator);
    registeredAccelerator = null;
  }

  mode = null;
}

export function shutdownInputHook(): void {
  stopHotkeyListener();
  try {
    uIOhook.stop();
  } catch (error) {
    console.warn('[hotkey] Failed to stop uiohook', error);
  }
}
