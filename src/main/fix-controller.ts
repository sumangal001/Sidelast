import { logCorrection } from './db/corrections';
import { sendWidgetState } from './widget-manager';
import { applyFixedText } from './services/apply-correction';
import { fixText } from './services/llm';
import { captureSelectedText } from './services/selection-capture';
import { getCurrentStyleProfile, onCorrectionLogged } from './services/style-profile';
import { watchForUndo } from './services/undo-watcher';

let fixInProgress = false;
let lastCapturedText: string | null = null;
let lastCorrectedText: string | null = null;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getLastCapturedText(): string | null {
  return lastCapturedText;
}

export function getLastCorrectedText(): string | null {
  return lastCorrectedText;
}

export function isFixInProgress(): boolean {
  return fixInProgress;
}

export async function runFixSession(): Promise<void> {
  if (fixInProgress) {
    return;
  }

  fixInProgress = true;
  lastCorrectedText = null;

  try {
    sendWidgetState('listening', 'Copying…');
    await delay(120);

    const capture = await captureSelectedText();
    if (!capture.ok) {
      sendWidgetState('error', capture.error);
      await delay(2000);
      return;
    }

    lastCapturedText = capture.text;

    sendWidgetState('fixing', 'Fixing…');
    const styleProfile = getCurrentStyleProfile();
    const correction = await fixText(capture.text, styleProfile);
    if (!correction.ok) {
      sendWidgetState('error', truncateError(correction.error));
      await delay(2500);
      return;
    }

    lastCorrectedText = correction.text;

    await applyFixedText(correction.text);

    const record = logCorrection(capture.text, correction.text);
    console.log(`[db] Logged correction #${record.id}: ${record.diff_summary}`);

    watchForUndo(record.id);
    onCorrectionLogged(record.id);

    sendWidgetState('fixed', 'Fixed');
    await delay(1200);
  } catch (error) {
    console.error('[fix] Session failed', error);
    sendWidgetState('error', 'Fix failed');
    await delay(2000);
  } finally {
    sendWidgetState('idle');
    fixInProgress = false;
  }
}

function truncateError(message: string): string {
  if (message.length <= 80) {
    return message;
  }
  return `${message.slice(0, 80)}…`;
}

export async function runManualFix(
  text: string
): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  if (fixInProgress) {
    return { ok: false, error: 'Busy — wait for current fix' };
  }

  if (!text.trim()) {
    return { ok: false, error: 'Type some text first' };
  }

  fixInProgress = true;

  try {
    sendWidgetState('fixing', 'Fixing…');
    const styleProfile = getCurrentStyleProfile();
    const correction = await fixText(text, styleProfile);

    if (!correction.ok) {
      sendWidgetState('error', truncateError(correction.error));
      return { ok: false, error: correction.error };
    }

    lastCapturedText = text;
    lastCorrectedText = correction.text;

    const record = logCorrection(text, correction.text);
    watchForUndo(record.id);
    onCorrectionLogged(record.id);

    sendWidgetState('fixed', 'Done — copy or paste');
    return { ok: true, text: correction.text };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Fix failed';
    sendWidgetState('error', truncateError(message));
    return { ok: false, error: message };
  } finally {
    fixInProgress = false;
  }
}

export async function pasteManualResult(text: string): Promise<{ ok: boolean }> {
  if (!text.trim()) {
    return { ok: false };
  }

  await applyFixedText(text);
  sendWidgetState('fixed', 'Pasted');
  return { ok: true };
}
