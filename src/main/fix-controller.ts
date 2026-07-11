import { sendWidgetState } from './widget-manager';
import { applyFixedText } from './services/apply-correction';
import { fixText } from './services/llm';
import { captureSelectedText } from './services/selection-capture';

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
    const correction = await fixText(capture.text);
    if (!correction.ok) {
      sendWidgetState('error', truncateError(correction.error));
      await delay(2500);
      return;
    }

    lastCorrectedText = correction.text;

    await applyFixedText(correction.text);

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
  if (message.length <= 28) {
    return message;
  }
  return `${message.slice(0, 28)}…`;
}
