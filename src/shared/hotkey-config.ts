import { UiohookKey } from 'uiohook-napi';
import type { HotkeyConfig, HotkeyKeyOption, HotkeyModifiers } from './hotkey-keys';

export const DEFAULT_HOTKEY_MODIFIERS: HotkeyModifiers = {
  ctrl: true,
  shift: true,
  alt: false,
};

export const DEFAULT_HOTKEY_KEY: HotkeyKeyOption = 'F';

const KEY_CODES: Record<HotkeyKeyOption, number> = {
  F: UiohookKey.F,
  G: UiohookKey.G,
  R: UiohookKey.R,
  E: UiohookKey.E,
  X: UiohookKey.X,
  C: UiohookKey.C,
  V: UiohookKey.V,
  Q: UiohookKey.Q,
  Z: UiohookKey.Z,
};

export function buildHotkeyLabel(
  modifiers: HotkeyModifiers,
  key: HotkeyKeyOption
): string {
  const parts: string[] = [];
  if (modifiers.ctrl) parts.push('Ctrl');
  if (modifiers.alt) parts.push('Alt');
  if (modifiers.shift) parts.push('Shift');
  parts.push(key);
  return parts.join('+');
}

export function buildAccelerator(
  modifiers: HotkeyModifiers,
  key: HotkeyKeyOption
): string {
  const parts: string[] = [];
  if (modifiers.ctrl) parts.push('CommandOrControl');
  if (modifiers.alt) parts.push('Alt');
  if (modifiers.shift) parts.push('Shift');
  parts.push(key);
  return parts.join('+');
}

export function buildHotkeyConfig(
  modifiers: HotkeyModifiers,
  key: HotkeyKeyOption
): HotkeyConfig {
  return {
    ...modifiers,
    key,
    keyCode: KEY_CODES[key],
    accelerator: buildAccelerator(modifiers, key),
    label: buildHotkeyLabel(modifiers, key),
  };
}

export const DEFAULT_HOTKEY = buildHotkeyConfig(
  DEFAULT_HOTKEY_MODIFIERS,
  DEFAULT_HOTKEY_KEY
);

export function getKeyCode(key: HotkeyKeyOption): number {
  return KEY_CODES[key];
}
