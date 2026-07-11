import type { WidgetState } from './widget-state';

export const IPC = {
  WIDGET_STATE: 'widget:state',
  WIDGET_TRIGGER_FIX: 'widget:trigger-fix',
  WIDGET_FIX_MANUAL: 'widget:fix-manual',
  WIDGET_PASTE_RESULT: 'widget:paste-result',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save',
  SETTINGS_CLEAR_DATA: 'settings:clear-data',
  SETTINGS_OPEN: 'settings:open',
  COMPOSER_OPEN: 'composer:open',
} as const;

export type WidgetStatePayload = {
  state: WidgetState;
  message?: string;
};
