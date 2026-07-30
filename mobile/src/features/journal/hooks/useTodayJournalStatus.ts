import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { getLatestEntryForDate } from '../repository';

export interface UseTodayJournalStatusResult {
  hasEntry: boolean;
  loading: boolean;
}

/**
 * Read-only "has today's journal been written?" signal for the home
 * screen. Refreshes on focus rather than on a timer or a forced remount,
 * so returning from the Journal tab reflects what was just written —
 * one query per visit, not a subscription or a poll.
 */
export function useTodayJournalStatus(date: string = getTodayDateString()): UseTodayJournalStatusResult {
  const db = useSQLiteContext();
  const [hasEntry, setHasEntry] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      getLatestEntryForDate(db, date).then((entry) => {
        if (!cancelled) {
          setHasEntry(entry !== null);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [db, date]),
  );

  return { hasEntry, loading };
}
