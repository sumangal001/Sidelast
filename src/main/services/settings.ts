import Store from 'electron-store';

export type LlmProvider = 'anthropic';

export type AppSettings = {
  apiKey: string;
  provider: LlmProvider;
  model: string;
};

const store = new Store<AppSettings>({
  name: 'stylefix-settings',
  defaults: {
    apiKey: '',
    provider: 'anthropic',
    model: 'claude-3-5-haiku-latest',
  },
});

export function getSettings(): AppSettings {
  return {
    apiKey: getApiKey(),
    provider: store.get('provider'),
    model: store.get('model'),
  };
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

export function setApiKey(apiKey: string): void {
  store.set('apiKey', apiKey.trim());
}

export function getSettingsPath(): string {
  return store.path;
}
