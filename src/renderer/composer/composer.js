const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const fixBtn = document.getElementById('fix-btn');
const copyBtn = document.getElementById('copy-btn');
const pasteBtn = document.getElementById('paste-btn');
const statusEl = document.getElementById('status');

function setStatus(message, type = '') {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.className = `status${type ? ` status--${type}` : ''}`;
}

fixBtn?.addEventListener('click', async () => {
  const text = inputText?.value ?? '';
  if (!window.stylefix?.fixManual) return;

  setStatus('Sending to AI…');
  fixBtn.disabled = true;

  const result = await window.stylefix.fixManual(text);
  fixBtn.disabled = false;

  if (!result.ok) {
    setStatus(result.error ?? 'Fix failed', 'error');
    return;
  }

  if (outputText) outputText.value = result.text;
  setStatus('Fixed! Copy or paste into your app.', 'ok');
});

copyBtn?.addEventListener('click', async () => {
  const text = outputText?.value ?? '';
  if (!text.trim()) {
    setStatus('Nothing to copy yet', 'error');
    return;
  }

  await navigator.clipboard.writeText(text);
  setStatus('Copied to clipboard', 'ok');
});

pasteBtn?.addEventListener('click', async () => {
  const text = outputText?.value ?? '';
  if (!text.trim()) {
    setStatus('Fix text first', 'error');
    return;
  }

  if (!window.stylefix?.pasteResult) return;

  setStatus('Pasting… focus your target app');
  const result = await window.stylefix.pasteResult(text);
  setStatus(
    result.ok ? 'Pasted into focused app' : 'Paste failed — use Copy',
    result.ok ? 'ok' : 'error'
  );
});

inputText?.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    fixBtn?.click();
  }
});

inputText?.focus();
