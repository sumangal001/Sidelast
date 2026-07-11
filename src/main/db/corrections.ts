import { buildDiffSummary } from './diff-summary';
import { getDatabase } from './database';

export type CorrectionRecord = {
  id: number;
  original_text: string;
  corrected_text: string;
  diff_summary: string;
  timestamp: number;
  rejected: number;
};

export function logCorrection(
  original: string,
  corrected: string
): CorrectionRecord {
  const diff_summary = buildDiffSummary(original, corrected);
  const timestamp = Math.floor(Date.now() / 1000);

  const result = getDatabase()
    .prepare(
      `INSERT INTO corrections (original_text, corrected_text, diff_summary, timestamp, rejected)
       VALUES (?, ?, ?, ?, 0)`
    )
    .run(original, corrected, diff_summary, timestamp);

  return {
    id: Number(result.lastInsertRowid),
    original_text: original,
    corrected_text: corrected,
    diff_summary,
    timestamp,
    rejected: 0,
  };
}

export function markCorrectionRejected(id: number): boolean {
  const result = getDatabase()
    .prepare('UPDATE corrections SET rejected = 1 WHERE id = ? AND rejected = 0')
    .run(id);

  return result.changes > 0;
}

export function getRecentCorrections(limit = 20): CorrectionRecord[] {
  return getDatabase()
    .prepare(
      `SELECT id, original_text, corrected_text, diff_summary, timestamp, rejected
       FROM corrections
       ORDER BY id DESC
       LIMIT ?`
    )
    .all(limit) as CorrectionRecord[];
}

export function getCorrectionCount(): number {
  const row = getDatabase()
    .prepare('SELECT COUNT(*) AS count FROM corrections')
    .get() as { count: number };

  return row.count;
}

export function countCorrectionsSince(lastId: number): number {
  const row = getDatabase()
    .prepare('SELECT COUNT(*) AS count FROM corrections WHERE id > ?')
    .get(lastId) as { count: number };

  return row.count;
}

export function getLatestCorrectionId(): number {
  const row = getDatabase()
    .prepare('SELECT MAX(id) AS id FROM corrections')
    .get() as { id: number | null };

  return row.id ?? 0;
}

export function getCorrectionsForSummarization(limit = 25): {
  accepted: CorrectionRecord[];
  rejected: CorrectionRecord[];
} {
  const recent = getRecentCorrections(limit);
  return {
    accepted: recent.filter((record) => record.rejected === 0),
    rejected: recent.filter((record) => record.rejected === 1),
  };
}
