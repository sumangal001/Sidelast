export type WidgetState = 'idle' | 'listening' | 'fixing' | 'fixed' | 'error';

export const WIDGET_STATE_META: Record<
  WidgetState,
  { label: string; icon: string; expanded: boolean }
> = {
  idle: { label: 'Ready', icon: '✎', expanded: false },
  listening: { label: 'Listening', icon: '◎', expanded: true },
  fixing: { label: 'Fixing…', icon: '⋯', expanded: true },
  fixed: { label: 'Fixed', icon: '✓', expanded: true },
  error: { label: 'Error', icon: '!', expanded: true },
};

export const WIDGET_SIZE = {
  compact: { width: 60, height: 60 },
  expanded: { width: 150, height: 60 },
} as const;
