import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'path';

let db: Database.Database | null = null;

export function getDatabasePath(): string {
  return path.join(app.getPath('userData'), 'stylefix.db');
}

export function initDatabase(): void {
  if (db) {
    return;
  }

  const dbPath = getDatabasePath();
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS corrections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      original_text TEXT NOT NULL,
      corrected_text TEXT NOT NULL,
      diff_summary TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      rejected INTEGER NOT NULL DEFAULT 0
    );

    CREATE INDEX IF NOT EXISTS idx_corrections_timestamp
      ON corrections (timestamp DESC);

    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content TEXT NOT NULL DEFAULT '',
      updated_at INTEGER NOT NULL DEFAULT 0,
      last_correction_id INTEGER NOT NULL DEFAULT 0
    );
  `);

  migrateDatabase(db);

  console.log(`[db] SQLite ready at ${dbPath}`);
}

function migrateDatabase(database: Database.Database): void {
  const columns = database
    .prepare('PRAGMA table_info(corrections)')
    .all() as { name: string }[];

  if (!columns.some((column) => column.name === 'rejected')) {
    database.exec(
      'ALTER TABLE corrections ADD COLUMN rejected INTEGER NOT NULL DEFAULT 0'
    );
  }
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized');
  }
  return db;
}

export function closeDatabase(): void {
  if (!db) {
    return;
  }

  db.close();
  db = null;
}
