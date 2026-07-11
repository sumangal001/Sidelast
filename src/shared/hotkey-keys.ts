export type HotkeyKeyOption =
  | 'F'
  | 'G'
  | 'R'
  | 'E'
  | 'X'
  | 'C'
  | 'V'
  | 'Q'
  | 'Z';

export const HOTKEY_KEY_OPTIONS: HotkeyKeyOption[] = [
  'F',
  'G',
  'R',
  'E',
  'X',
  'C',
  'V',
  'Q',
  'Z',
];

export type HotkeyModifiers = {
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
};

export type HotkeyConfig = HotkeyModifiers & {
  key: HotkeyKeyOption;
  keyCode: number;
  accelerator: string;
  label: string;
};
