import Store from 'electron-store';
import {
  DEFAULT_HOTKEY,
  DEFAULT_HOTKEY_KEY,
  DEFAULT_HOTKEY_MODIFIERS,
  buildHotkeyConfig,
} from '../../shared/hotkey-config';
import type { HotkeyConfig, HotkeyKeyOption, HotkeyModifiers } from '../../shared/hotkey-keys';
import type { SettingsSavePayload, SettingsSnapshot } from '../../shared/settings-types';
import { getCorrectionCount } from '../db/corrections';
import { getDatabasePath } from '../db/database';
import { getStyleProfileContent, updateProfileContent } from '../db/profile';
import { applyLaunchAtLogin, readLaunchAtLogin } from './launch-at-login';

export type LlmProvider = 'anthropic';

type StoredSettings = {
  apiKey: string;
  provider: LlmProvider;
  model: string;
  autoLearn: boolean;
  launchAtLogin: boolean;
  hotkeyKey: HotkeyKeyOption;
  hotkeyCtrl: boolean;
  hotkeyShift: boolean;
  hotkeyAlt: boolean;
};

const store = new Store<StoredSettings>({
  name: 'stylefix-settings',
  defaults: {
    apiKey: '',
    provider: 'anthropic',
    model: 'claude-3-5-haiku-latest',
    autoLearn: true,
    launchAtLogin: false,
    hotkeyKey: DEFAULT_HOTKEY_KEY,
    hotkeyCtrl: DEFAULT_HOTKEY_MODIFIERS.ctrl,
    hotkeyShift: DEFAULT_HOTKEY_MODIFIERS.shift,
    hotkeyAlt: DEFAULT_HOTKEY_MODIFIERS.alt,
  },
});

export function getHotkeyConfig(): HotkeyConfig {
  return buildHotkeyConfig(getHotkeyModifiers(), store.get('hotkeyKey'));
}

function getHotkeyModifiers(): HotkeyModifiers {
  return {
    ctrl: store.get('hotkeyCtrl'),
    shift: store.get('hotkeyShift'),
    alt: store.get('hotkeyAlt'),
  };
}

export function getSettingsSnapshot(): SettingsSnapshot {
  const storedKey = store.get('apiKey').trim();
  const envKey = !!(
    process.env.ANTHROPIC_API_KEY?.trim() || process.env.STYLEFIX_API_KEY?.trim()
  );

  return {
    hasApiKey: !!(storedKey || envKey),
    apiKeyFromEnv: !storedKey && envKey,
    provider: 'anthropic',
    model: store.get('model'),
    autoLearn: store.get('autoLearn'),
    launchAtLogin: readLaunchAtLogin(),
    hotkey: getHotkeyConfig(),
    styleProfile: getStyleProfileContent(),
    correctionCount: getCorrectionCount(),
    paths: {
      database: getDatabasePath(),
      settings: store.path,
    },
  };
}

export function saveSettings(payload: SettingsSavePayload): SettingsSnapshot {
  if (payload.removeApiKey) {
    store.set('apiKey', '');
  } else if (payload.apiKey !== undefined && payload.apiKey.trim()) {
    store.set('apiKey', payload.apiKey.trim());
  }

  if (payload.model !== undefined) {
    store.set('model', payload.model.trim() || 'claude-3-5-haiku-latest');
  }

  if (payload.autoLearn !== undefined) {
    store.set('autoLearn', payload.autoLearn);
  }

  if (payload.launchAtLogin !== undefined) {
    store.set('launchAtLogin', payload.launchAtLogin);
    applyLaunchAtLogin(payload.launchAtLogin);
  }

  if (payload.hotkey) {
    if (!payload.hotkey.ctrl && !payload.hotkey.shift && !payload.hotkey.alt) {
      throw new Error('Hotkey must include at least one modifier');
    }

    store.set('hotkeyKey', payload.hotkey.key);
    store.set('hotkeyCtrl', payload.hotkey.ctrl);
    store.set('hotkeyShift', payload.hotkey.shift);
    store.set('hotkeyAlt', payload.hotkey.alt);
  }

  if (payload.styleProfile !== undefined) {
    updateProfileContent(payload.styleProfile);
  }

  return getSettingsSnapshot();
}

export function getApiKey(): string {
  const stored = store.get('apiKey').trim();
  if (stored) {
    return stored;
  }

  return (
    process.env.ANTHROPIC_API_KEY?.trim() ||
    process.env.STYLEFIX_API_KEY?.trim() ||
    ''
  );
}

export function getAutoLearn(): boolean {
  return store.get('autoLearn');
}

export function getSettingsPath(): string {
  return store.path;
}

export function getModel(): string {
  return store.get('model');
}

export function syncLaunchAtLoginFromStore(): void {
  applyLaunchAtLogin(store.get('launchAtLogin'));
}
