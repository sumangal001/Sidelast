import { writeClipboardText } from './clipboard';
import { simulatePaste } from './keyboard';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function applyFixedText(text: string): Promise<void> {
  writeClipboardText(text);
  await delay(80);
  await simulatePaste();
}
