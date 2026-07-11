import { getDatabase } from './database';

export type ProfileRecord = {
  id: number;
  content: string;
  updated_at: number;
  last_correction_id: number;
};

const PROFILE_ID = 1;

export function ensureProfileRow(): void {
  const existing = getDatabase()
    .prepare('SELECT id FROM profile WHERE id = ?')
    .get(PROFILE_ID);

  if (!existing) {
    getDatabase()
      .prepare(
        `INSERT INTO profile (id, content, updated_at, last_correction_id)
         VALUES (?, '', 0, 0)`
      )
      .run(PROFILE_ID);
  }
}

export function getProfile(): ProfileRecord {
  ensureProfileRow();
  return getDatabase()
    .prepare(
      `SELECT id, content, updated_at, last_correction_id
       FROM profile WHERE id = ?`
    )
    .get(PROFILE_ID) as ProfileRecord;
}

export function getStyleProfileContent(): string {
  return getProfile().content.trim();
}

export function saveProfile(content: string, lastCorrectionId: number): void {
  ensureProfileRow();
  const updatedAt = Math.floor(Date.now() / 1000);

  getDatabase()
    .prepare(
      `UPDATE profile
       SET content = ?, updated_at = ?, last_correction_id = ?
       WHERE id = ?`
    )
    .run(content.trim(), updatedAt, lastCorrectionId, PROFILE_ID);
}

export function clearProfile(): void {
  saveProfile('', 0);
}

export function updateProfileContent(content: string): void {
  const profile = getProfile();
  saveProfile(content, profile.last_correction_id);
}
