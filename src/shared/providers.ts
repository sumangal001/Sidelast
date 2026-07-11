export type LlmProvider = 'gemini' | 'anthropic';

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  gemini: 'Google Gemini (Free)',
  anthropic: 'Anthropic (Paid credits)',
};

export const DEFAULT_MODELS: Record<LlmProvider, string> = {
  gemini: 'gemini-2.0-flash',
  anthropic: 'claude-3-5-haiku-latest',
};

export const API_KEY_PLACEHOLDERS: Record<LlmProvider, string> = {
  gemini: 'AIza...',
  anthropic: 'sk-ant-...',
};
