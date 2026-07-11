import type { LlmProvider } from './providers';
import type { HotkeyConfig, HotkeyKeyOption, HotkeyModifiers } from './hotkey-keys';

export type SettingsSnapshot = {
  hasApiKey: boolean;
  apiKeyFromEnv: boolean;
  provider: LlmProvider;
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
  provider?: LlmProvider;
  model?: string;
  autoLearn?: boolean;
  launchAtLogin?: boolean;
  hotkey?: HotkeyModifiers & { key: HotkeyKeyOption };
  styleProfile?: string;
};
