import { readClipboardText, waitForClipboardText } from './clipboard';
import { simulateCopy } from './keyboard';

export type CaptureResult =
  | { ok: true; text: string }
  | { ok: false; error: string };

export async function captureSelectedText(): Promise<CaptureResult> {
  const before = readClipboardText();

  await simulateCopy();

  const text = await waitForClipboardText(before);
  if (!text) {
    return { ok: false, error: 'No text selected' };
  }

  return { ok: true, text };
}
