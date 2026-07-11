import type { HotkeyConfig, HotkeyKeyOption, HotkeyModifiers } from './hotkey-keys';

export type SettingsSnapshot = {
  hasApiKey: boolean;
  apiKeyFromEnv: boolean;
  provider: 'anthropic';
  model: string;
  autoLearn: boolean;
  launchAtLogin: boolean;
  hotkey: HotkeyConfig;
  styleProfile: string;
  correctionCount: number;
  paths: {
    database: string;
    settings: string;
  };
};

export type SettingsSavePayload = {
  apiKey?: string;
  removeApiKey?: boolean;
  model?: string;
  autoLearn?: boolean;
  launchAtLogin?: boolean;
  hotkey?: HotkeyModifiers & { key: HotkeyKeyOption };
  styleProfile?: string;
};
