import type { SQLiteDatabase } from 'expo-sqlite';

import type { JournalDraft } from '../types';

interface JournalDraftRow {
  id: number;
  entry_date: string;
  entry_id: number | null;
  body: string;
  updated_at: string;
}

function mapRow(row: JournalDraftRow): JournalDraft {
  return {
    id: row.id,
    entryDate: row.entry_date,
    entryId: row.entry_id,
    body: row.body,
    updatedAt: row.updated_at,
  };
}

export async function getDraftForDate(db: SQLiteDatabase, date: string): Promise<JournalDraft | null> {
  const row = await db.getFirstAsync<JournalDraftRow>('SELECT * FROM journal_drafts WHERE entry_date = ?', date);
  return row ? mapRow(row) : null;
}

/** One active draft per date, upserted on every autosave checkpoint — the crash-recovery source read back on the next launch. */
export async function saveDraft(
  db: SQLiteDatabase,
  date: string,
  entryId: number | null,
  body: string,
): Promise<JournalDraft> {
  await db.runAsync(
    `INSERT INTO journal_drafts (entry_date, entry_id, body) VALUES (?, ?, ?)
     ON CONFLICT (entry_date) DO UPDATE SET entry_id = excluded.entry_id, body = excluded.body, updated_at = datetime('now')`,
    date,
    entryId,
    body,
  );
  const row = await db.getFirstAsync<JournalDraftRow>('SELECT * FROM journal_drafts WHERE entry_date = ?', date);
  if (!row) {
    throw new Error('saveDraft: row missing immediately after insert');
  }
  return mapRow(row);
}

/** Called once a draft's contents have been safely committed to the canonical entry — clears the crash-recovery buffer so it doesn't linger as stale "unsaved" state. */
export async function discardDraft(db: SQLiteDatabase, date: string): Promise<void> {
  await db.runAsync('DELETE FROM journal_drafts WHERE entry_date = ?', date);
}
