import type { SQLiteDatabase } from 'expo-sqlite';

import {
  createEntry,
  discardDraft,
  getDraftForDate,
  getLatestEntryForDate,
  saveDraft as saveDraftRow,
  updateEntryBody,
} from '../repository';
import type { JournalEntry } from '../types';

export interface EditableJournalContent {
  entryId: number | null;
  body: string;
  /** True when this came from an unsaved draft rather than the last saved entry. */
  recoveredFromDraft: boolean;
  /** When this content was last touched — `null` for a blank, never-saved canvas. Basic entry metadata for consumers like the AI context builder. */
  updatedAt: string | null;
}

/**
 * The Journal's business logic — hooks call this, never the repositories
 * directly (UI → Hook → Feature Service → Repository → SQLite). Today
 * this is thin on purpose: it owns what "today's editable content" means
 * and when a write is actually worth making. It's the layer that will
 * later grow validation, derived calculations, analytics events, AI
 * package generation, and sync, without the hooks or UI needing to change.
 */
export const JournalService = {
  /** What the editor should show on open: an unsaved draft if one exists (crash recovery), else the last saved entry, else a blank canvas. */
  async getEditableContent(db: SQLiteDatabase, date: string): Promise<EditableJournalContent> {
    const draft = await getDraftForDate(db, date);
    if (draft) {
      return { entryId: draft.entryId, body: draft.body, recoveredFromDraft: true, updatedAt: draft.updatedAt };
    }

    const entry = await getLatestEntryForDate(db, date);
    if (entry) {
      return { entryId: entry.id, body: entry.body, recoveredFromDraft: false, updatedAt: entry.updatedAt };
    }

    return { entryId: null, body: '', recoveredFromDraft: false, updatedAt: null };
  },

  /**
   * The autosave engine's fast-tier checkpoint. Skips writing a draft row
   * for content that's still empty and has never been saved, so opening
   * the Journal and immediately leaving doesn't create a junk row.
   */
  async saveDraft(db: SQLiteDatabase, date: string, entryId: number | null, body: string): Promise<void> {
    if (body.trim().length === 0 && entryId === null) {
      return;
    }
    await saveDraftRow(db, date, entryId, body);
  },

  /**
   * Flushes the current text into the canonical entry, then clears the
   * draft — the only place a `JournalEntry` row is actually written.
   * Never persists a genuinely empty, never-saved entry.
   */
  async commitEntry(
    db: SQLiteDatabase,
    date: string,
    entryId: number | null,
    body: string,
  ): Promise<JournalEntry | null> {
    if (body.trim().length === 0 && entryId === null) {
      return null;
    }

    const saved = entryId === null ? await createEntry(db, date, body) : await updateEntryBody(db, entryId, body);
    await discardDraft(db, date);
    return saved;
  },
};
