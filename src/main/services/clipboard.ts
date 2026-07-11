import { clipboard } from 'electron';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function readClipboardText(): string {
  return clipboard.readText();
}

export function writeClipboardText(text: string): void {
  clipboard.writeText(text);
}

export async function waitForClipboardText(
  previous: string,
  options: { timeoutMs?: number; pollMs?: number } = {}
): Promise<string> {
  const timeoutMs = options.timeoutMs ?? 700;
  const pollMs = options.pollMs ?? 50;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    await delay(pollMs);
    const current = clipboard.readText();
    if (current.trim().length > 0 && current !== previous) {
      return current;
    }
  }

  const final = clipboard.readText().trim();
  return final;
}
