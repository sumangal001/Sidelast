import type { WidgetStatePayload } from '../shared/ipc';
import type { SettingsSavePayload, SettingsSnapshot } from '../shared/settings-types';

export {};

declare global {
  interface Window {
    stylefix: {
      version: string;
      triggerFix: () => Promise<{ ok: boolean; reason?: string }>;
      onStateChange: (callback: (payload: WidgetStatePayload) => void) => () => void;
      openSettings: () => void;
      getSettings: () => Promise<SettingsSnapshot>;
      saveSettings: (
        payload: SettingsSavePayload
      ) => Promise<
        | { ok: true; snapshot: SettingsSnapshot }
        | { ok: false; error: string }
      >;
      clearLearnedData: () => Promise<SettingsSnapshot>;
    };
  }
}
