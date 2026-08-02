import type { SQLiteDatabase } from 'expo-sqlite';
import type { BackupPayload, BackupRow } from './types';

/**
 * `cycle_settings` is a fixed singleton (`id INTEGER PRIMARY KEY CHECK (id
 * = 1)`, no AUTOINCREMENT) already seeded by the migration itself —
 * restoring it has to be an UPDATE, not an INSERT, or its own CHECK
 * constraint rejects the duplicate id.
 */
const SINGLETON_TABLES = new Set(['cycle_settings']);

/**
 * Tables that use `id INTEGER PRIMARY KEY AUTOINCREMENT` — after
 * restoring explicit ids into these, their `sqlite_sequence` counter gets
 * primed to the restored max so the next normal insert can never collide
 * with a restored row.
 */
const AUTOINCREMENT_TABLES = [
  'food_logs',
  'workout_logs',
  'water_logs',
  'weight_logs',
  'journal_entries',
  'journal_drafts',
  'water_entries',
  'water_goals',
  'sleep_logs',
  'cycle_logs',
  'ai_reports',
  'exercise_library',
  'workout_templates',
  'template_exercises',
  'workout_sessions',
  'workout_session_exercises',
];

export interface ImportSummary {
  rowsImported: number;
  tablesImported: string[];
}

function isBackupPayload(value: unknown): value is BackupPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    'tables' in value &&
    typeof (value as { tables: unknown }).tables === 'object'
  );
}

async function importSingletonRow(db: SQLiteDatabase, table: string, row: BackupRow): Promise<void> {
  const columns = Object.keys(row).filter((column) => column !== 'id');
  const setClause = columns.map((column) => `${column} = ?`).join(', ');
  await db.runAsync(`UPDATE ${table} SET ${setClause} WHERE id = ?`, ...columns.map((c) => row[c]), row.id);
}

async function importRow(db: SQLiteDatabase, table: string, row: BackupRow): Promise<void> {
  const columns = Object.keys(row);
  const placeholders = columns.map(() => '?').join(', ');
  await db.runAsync(
    `INSERT OR IGNORE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
    ...columns.map((c) => row[c]),
  );
}

/**
 * Restores a payload from `exportBackup` into the current database. Row
 * ids are preserved (never re-assigned) so foreign keys between tables —
 * `journal_drafts` → `journal_entries`, `template_exercises` →
 * `workout_templates`, etc. — stay intact. `INSERT OR IGNORE` makes this
 * safe to run twice without duplicating rows, at the cost of silently
 * skipping a row that was already edited locally since a first import.
 */
export async function importBackup(db: SQLiteDatabase, json: string): Promise<ImportSummary> {
  let payload: unknown;
  try {
    payload = JSON.parse(json);
  } catch {
    throw new Error("That doesn't look like valid backup data.");
  }
  if (!isBackupPayload(payload)) {
    throw new Error("That doesn't look like valid backup data.");
  }

  let rowsImported = 0;
  const tablesImported: string[] = [];

  for (const [table, rows] of Object.entries(payload.tables)) {
    if (!Array.isArray(rows) || rows.length === 0) continue;

    for (const row of rows) {
      if (SINGLETON_TABLES.has(table)) {
        await importSingletonRow(db, table, row);
      } else {
        await importRow(db, table, row);
      }
    }

    rowsImported += rows.length;
    tablesImported.push(table);
  }

  for (const table of AUTOINCREMENT_TABLES) {
    await db.runAsync(
      `INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES (?, (SELECT COALESCE(MAX(id), 0) FROM ${table}))`,
      table,
    );
  }

  return { rowsImported, tablesImported };
}
