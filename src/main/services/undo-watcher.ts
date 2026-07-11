import { uIOhook, UiohookKey } from 'uiohook-napi';
import { UNDO_WATCH_MS } from '../../shared/style-config';
import { markCorrectionRejected } from '../db/corrections';
import { getAutoLearn } from './settings';

let pendingCorrectionId: number | null = null;
let watchTimeout: NodeJS.Timeout | null = null;
let watching = false;

function onKeyDown(event: {
  ctrlKey: boolean;
  keycode: number;
}): void {
  if (!watching || pendingCorrectionId === null) {
    return;
  }

  if (event.ctrlKey && event.keycode === UiohookKey.Z) {
    if (markCorrectionRejected(pendingCorrectionId)) {
      console.log(
        `[style] Correction #${pendingCorrectionId} marked rejected (Ctrl+Z detected)`
      );
    }
    stopUndoWatch();
  }
}

export function watchForUndo(correctionId: number): void {
  if (!getAutoLearn()) {
    return;
  }

  stopUndoWatch();
  pendingCorrectionId = correctionId;
  watching = true;
  uIOhook.on('keydown', onKeyDown);

  watchTimeout = setTimeout(() => {
    stopUndoWatch();
  }, UNDO_WATCH_MS);
}

export function stopUndoWatch(): void {
  watching = false;
  pendingCorrectionId = null;
  uIOhook.off('keydown', onKeyDown);

  if (watchTimeout) {
    clearTimeout(watchTimeout);
    watchTimeout = null;
  }
}
