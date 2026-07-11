export type LlmProvider = 'groq' | 'gemini' | 'anthropic';

export const PROVIDER_LABELS: Record<LlmProvider, string> = {
  groq: 'Groq (Free — recommended)',
  gemini: 'Google Gemini (Free)',
  anthropic: 'Anthropic (Paid)',
};

export const DEFAULT_MODELS: Record<LlmProvider, string> = {
  groq: 'llama-3.3-70b-versatile',
  gemini: 'gemini-2.0-flash',
  anthropic: 'claude-3-5-haiku-latest',
};

export const API_KEY_PLACEHOLDERS: Record<LlmProvider, string> = {
  groq: 'gsk_...',
  gemini: 'AIza... or AQ....',
  anthropic: 'sk-ant-...',
};

export const PROVIDER_KEY_URLS: Record<LlmProvider, string> = {
  groq: 'https://console.groq.com/keys',
  gemini: 'https://aistudio.google.com/apikey',
  anthropic: 'https://console.anthropic.com/',
};
