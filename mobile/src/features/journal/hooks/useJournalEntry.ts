import { useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { useAutosaveEngine, type AutosaveStatus } from '../draft';
import { JournalService } from '../services';

export interface UseJournalEntryResult {
  body: string;
  setBody: (body: string) => void;
  loading: boolean;
  saveStatus: AutosaveStatus;
}

/**
 * The Journal editor's single public hook. Composes the service and the
 * autosave engine so the UI only ever sees `body`/`setBody` — it never
 * touches a repository or knows a draft table exists.
 */
export function useJournalEntry(date: string = getTodayDateString()): UseJournalEntryResult {
  const db = useSQLiteContext();
  const [entryId, setEntryId] = useState<number | null>(null);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    // Mirrors React's own documented data-fetching effect (reset, then set
    // again from the async callback once it resolves).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    JournalService.getEditableContent(db, date).then((content) => {
      if (!cancelled) {
        setEntryId(content.entryId);
        setBody(content.body);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db, date]);

  const { status } = useAutosaveEngine(body, {
    isLoaded: !loading,
    onDraftSave: (value) => {
      JournalService.saveDraft(db, date, entryId, value);
    },
    onCommit: async (value) => {
      const saved = await JournalService.commitEntry(db, date, entryId, value);
      if (saved) {
        setEntryId(saved.id);
      }
    },
  });

  return { body, setBody, loading, saveStatus: status };
}
