import type { WidgetStatePayload } from '../shared/ipc';

export {};

declare global {
  interface Window {
    stylefix: {
      version: string;
      triggerFix: () => Promise<{ ok: boolean; reason?: string }>;
      onStateChange: (callback: (payload: WidgetStatePayload) => void) => () => void;
    };
  }
}
