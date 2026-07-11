import type { WidgetStatePayload } from '../shared/ipc';
import type { SettingsSavePayload, SettingsSnapshot } from '../shared/settings-types';

export {};

declare global {
  interface Window {
    stylefix: {
      version: string;
      triggerFix: () => Promise<{ ok: boolean; reason?: string }>;
      fixManual: (
        text: string
      ) => Promise<{ ok: true; text: string } | { ok: false; error: string }>;
      pasteResult: (text: string) => Promise<{ ok: boolean }>;
      onStateChange: (callback: (payload: WidgetStatePayload) => void) => () => void;
      openSettings: () => void;
      openComposer: () => void;
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
