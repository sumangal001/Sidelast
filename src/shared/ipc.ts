import type { WidgetState } from './widget-state';

export const IPC = {
  WIDGET_STATE: 'widget:state',
  WIDGET_TRIGGER_FIX: 'widget:trigger-fix',
} as const;

export type WidgetStatePayload = {
  state: WidgetState;
  message?: string;
};
