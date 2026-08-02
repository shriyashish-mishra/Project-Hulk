import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { getLatestEntryForDate } from '../repository';

export interface UseTodayJournalStatusResult {
  hasEntry: boolean;
  /** First line of the entry body, or `''` when there's no entry yet — cheap enough for a dashboard row preview without pulling in the full autosave-backed editor hook. */
  preview: string;
  loading: boolean;
}

/**
 * Read-only "has this day's journal been written?" signal, for the
 * Journal dashboard's Notes row preview. Refreshes on focus rather than
 * on a timer or a forced remount, so returning from the Notes sheet
 * reflects what was just written — one query per visit, not a
 * subscription or a poll.
 */
export function useTodayJournalStatus(date: string = getTodayDateString()): UseTodayJournalStatusResult {
  const db = useSQLiteContext();
  const [hasEntry, setHasEntry] = useState(false);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getLatestEntryForDate(db, date).then((entry) => {
        if (!cancelled) {
          setHasEntry(entry !== null);
          setPreview(entry?.body.split('\n')[0]?.trim() ?? '');
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [db, date]),
  );

  return { hasEntry, preview, loading };
}
