const HOTKEY_KEYS = ['F', 'G', 'R', 'E', 'X', 'C', 'V', 'Q', 'Z'];

const form = document.getElementById('settings-form');
const providerSelect = document.getElementById('provider');
const apiKeyLabel = document.getElementById('api-key-label');
const apiKeyInput = document.getElementById('api-key');
const removeApiKeyInput = document.getElementById('remove-api-key');
const apiKeyHint = document.getElementById('api-key-hint');
const modelInput = document.getElementById('model');
const hotkeyKeySelect = document.getElementById('hotkey-key');
const hotkeyShiftInput = document.getElementById('hotkey-shift');
const hotkeyAltInput = document.getElementById('hotkey-alt');
const hotkeyPreview = document.getElementById('hotkey-preview');
const autoLearnInput = document.getElementById('auto-learn');
const launchAtLoginInput = document.getElementById('launch-at-login');
const styleProfileInput = document.getElementById('style-profile');
const correctionCount = document.getElementById('correction-count');
const dbPathInput = document.getElementById('db-path');
const settingsPathInput = document.getElementById('settings-path');
const clearDataButton = document.getElementById('clear-data');
const statusEl = document.getElementById('status');

const PROVIDER_DEFAULTS = {
  gemini: { model: 'gemini-2.0-flash', placeholder: 'AIza...', label: 'Google Gemini API key' },
  anthropic: { model: 'claude-3-5-haiku-latest', placeholder: 'sk-ant-...', label: 'Anthropic API key' },
};

function updateProviderUi(provider) {
  const config = PROVIDER_DEFAULTS[provider] ?? PROVIDER_DEFAULTS.gemini;
  if (apiKeyLabel) apiKeyLabel.textContent = config.label;
  if (apiKeyInput) apiKeyInput.placeholder = config.placeholder;
  if (modelInput && !modelInput.value.trim()) {
    modelInput.placeholder = config.model;
  }
}

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = isError ? 'status status--error' : 'status';
}

function updateHotkeyPreview() {
  if (!hotkeyPreview || !hotkeyKeySelect) return;
  const parts = ['Ctrl'];
  if (hotkeyShiftInput?.checked) parts.push('Shift');
  if (hotkeyAltInput?.checked) parts.push('Alt');
  parts.push(hotkeyKeySelect.value);
  hotkeyPreview.textContent = `Shortcut: ${parts.join('+')}`;
}

function populateHotkeyOptions(selectedKey) {
  if (!hotkeyKeySelect) return;
  hotkeyKeySelect.innerHTML = '';
  for (const key of HOTKEY_KEYS) {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = key;
    if (key === selectedKey) {
      option.selected = true;
    }
    hotkeyKeySelect.appendChild(option);
  }
}

function applySnapshot(snapshot) {
  if (providerSelect) providerSelect.value = snapshot.provider;
  updateProviderUi(snapshot.provider);
  if (modelInput) modelInput.value = snapshot.model;
  if (autoLearnInput) autoLearnInput.checked = snapshot.autoLearn;
  if (launchAtLoginInput) launchAtLoginInput.checked = snapshot.launchAtLogin;
  if (styleProfileInput) styleProfileInput.value = snapshot.styleProfile;
  if (dbPathInput) dbPathInput.value = snapshot.paths.database;
  if (settingsPathInput) settingsPathInput.value = snapshot.paths.settings;
  if (correctionCount) {
    correctionCount.textContent = `${snapshot.correctionCount} correction(s) stored`;
  }

  populateHotkeyOptions(snapshot.hotkey.key);
  if (hotkeyShiftInput) hotkeyShiftInput.checked = snapshot.hotkey.shift;
  if (hotkeyAltInput) hotkeyAltInput.checked = snapshot.hotkey.alt;
  updateHotkeyPreview();

  if (apiKeyHint) {
    if (snapshot.apiKeyFromEnv) {
      apiKeyHint.textContent = 'Using API key from environment variable';
    } else if (snapshot.hasApiKey) {
      apiKeyHint.textContent = 'API key saved locally (leave blank to keep)';
    } else {
      apiKeyHint.textContent = 'Required for text fixes';
    }
  }

  if (apiKeyInput) apiKeyInput.value = '';
  if (removeApiKeyInput) removeApiKeyInput.checked = false;
}

async function loadSettings() {
  if (!window.stylefix?.getSettings) return;
  const snapshot = await window.stylefix.getSettings();
  applySnapshot(snapshot);
}

async function saveSettings(event) {
  event.preventDefault();
  if (!window.stylefix?.saveSettings) return;

  const shift = hotkeyShiftInput?.checked ?? true;
  const alt = hotkeyAltInput?.checked ?? false;
  if (!shift && !alt) {
    setStatus('Hotkey needs Shift and/or Alt with Ctrl', true);
    return;
  }

  const payload = {
    apiKey: apiKeyInput?.value?.trim() || undefined,
    removeApiKey: removeApiKeyInput?.checked ?? false,
    provider: providerSelect?.value ?? 'gemini',
    model: modelInput?.value?.trim(),
    autoLearn: autoLearnInput?.checked ?? true,
    launchAtLogin: launchAtLoginInput?.checked ?? false,
    hotkey: {
      key: hotkeyKeySelect?.value ?? 'F',
      ctrl: true,
      shift,
      alt,
    },
    styleProfile: styleProfileInput?.value ?? '',
  };

  const result = await window.stylefix.saveSettings(payload);
  if (!result.ok) {
    setStatus(result.error, true);
    return;
  }

  applySnapshot(result.snapshot);
  setStatus('Settings saved');
}

async function clearLearnedData() {
  if (!window.stylefix?.clearLearnedData) return;

  const confirmed = window.confirm(
    'Delete all correction history and the learned style profile? This cannot be undone.'
  );
  if (!confirmed) return;

  const snapshot = await window.stylefix.clearLearnedData();
  applySnapshot(snapshot);
  setStatus('Learned data cleared');
}

document.addEventListener('DOMContentLoaded', () => {
  void loadSettings();

  form?.addEventListener('submit', (event) => {
    void saveSettings(event);
  });

  hotkeyKeySelect?.addEventListener('change', updateHotkeyPreview);
  hotkeyShiftInput?.addEventListener('change', updateHotkeyPreview);
  hotkeyAltInput?.addEventListener('change', updateHotkeyPreview);

  providerSelect?.addEventListener('change', () => {
    updateProviderUi(providerSelect.value);
  });

  clearDataButton?.addEventListener('click', () => {
    void clearLearnedData();
  });
});
