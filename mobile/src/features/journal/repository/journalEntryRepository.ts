import type { SQLiteDatabase } from 'expo-sqlite';

import type { JournalEntry } from '../types';

interface JournalEntryRow {
  id: number;
  entry_date: string;
  body: string;
  created_at: string;
  updated_at: string;
}

function mapRow(row: JournalEntryRow): JournalEntry {
  return {
    id: row.id,
    entryDate: row.entry_date,
    body: row.body,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/** The most recently updated entry for a date — "today's entry" for as long as the UI only ever shows one continuous entry per day. */
export async function getLatestEntryForDate(db: SQLiteDatabase, date: string): Promise<JournalEntry | null> {
  const row = await db.getFirstAsync<JournalEntryRow>(
    'SELECT * FROM journal_entries WHERE entry_date = ? ORDER BY updated_at DESC LIMIT 1',
    date,
  );
  return row ? mapRow(row) : null;
}

export async function createEntry(db: SQLiteDatabase, date: string, body: string): Promise<JournalEntry> {
  const result = await db.runAsync('INSERT INTO journal_entries (entry_date, body) VALUES (?, ?)', date, body);
  const row = await db.getFirstAsync<JournalEntryRow>(
    'SELECT * FROM journal_entries WHERE id = ?',
    result.lastInsertRowId,
  );
  if (!row) {
    throw new Error('createEntry: row missing immediately after insert');
  }
  return mapRow(row);
}

export async function updateEntryBody(db: SQLiteDatabase, id: number, body: string): Promise<JournalEntry> {
  await db.runAsync(`UPDATE journal_entries SET body = ?, updated_at = datetime('now') WHERE id = ?`, body, id);
  const row = await db.getFirstAsync<JournalEntryRow>('SELECT * FROM journal_entries WHERE id = ?', id);
  if (!row) {
    throw new Error('updateEntryBody: row missing immediately after update');
  }
  return mapRow(row);
}
