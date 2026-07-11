import type { WidgetState } from './widget-state';

export const IPC = {
  WIDGET_STATE: 'widget:state',
  WIDGET_TRIGGER_FIX: 'widget:trigger-fix',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save',
  SETTINGS_CLEAR_DATA: 'settings:clear-data',
  SETTINGS_OPEN: 'settings:open',
} as const;

export type WidgetStatePayload = {
  state: WidgetState;
  message?: string;
};
