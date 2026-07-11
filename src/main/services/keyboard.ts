import { execFile } from 'child_process';
import { promisify } from 'util';
import { uIOhook, UiohookKey } from 'uiohook-napi';

const execFileAsync = promisify(execFile);

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateCopyViaSendKeys(): Promise<void> {
  await execFileAsync(
    'powershell.exe',
    [
      '-NoProfile',
      '-WindowStyle',
      'Hidden',
      '-Command',
      "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^c')",
    ],
    { windowsHide: true }
  );
}

async function simulatePasteViaSendKeys(): Promise<void> {
  await execFileAsync(
    'powershell.exe',
    [
      '-NoProfile',
      '-WindowStyle',
      'Hidden',
      '-Command',
      "Add-Type -AssemblyName System.Windows.Forms; [System.Windows.Forms.SendKeys]::SendWait('^v')",
    ],
    { windowsHide: true }
  );
}

export async function simulateCopy(): Promise<void> {
  try {
    uIOhook.keyTap(UiohookKey.C, [UiohookKey.Ctrl]);
    await delay(100);
    return;
  } catch (error) {
    console.warn('[keyboard] uiohook keyTap failed, using SendKeys fallback', error);
  }

  await simulateCopyViaSendKeys();
  await delay(150);
}

export async function simulatePaste(): Promise<void> {
  try {
    uIOhook.keyTap(UiohookKey.V, [UiohookKey.Ctrl]);
    await delay(100);
    return;
  } catch (error) {
    console.warn('[keyboard] uiohook paste failed, using SendKeys fallback', error);
  }

  await simulatePasteViaSendKeys();
  await delay(150);
}
