import { app } from 'electron';

export function readLaunchAtLogin(): boolean {
  return app.getLoginItemSettings().openAtLogin;
}

export function applyLaunchAtLogin(enabled: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enabled,
    openAsHidden: false,
    path: process.execPath,
    args: [],
  });
}
