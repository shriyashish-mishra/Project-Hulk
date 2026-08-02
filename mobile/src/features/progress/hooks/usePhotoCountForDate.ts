import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { ProgressPhotoService } from '../services';

export interface UsePhotoCountForDateResult {
  count: number;
  loading: boolean;
}

/**
 * Read-only "how many photos for this day?" signal for the Journal
 * dashboard's Photos row preview. Refreshes on focus rather than on a
 * timer — the dashboard and the pushed `/photos/[date]` screen are
 * separate mounts, so returning from capturing a photo needs a refetch,
 * not just a `useEffect` keyed on `date` (which wouldn't re-run at all).
 */
export function usePhotoCountForDate(date: string): UsePhotoCountForDateResult {
  const db = useSQLiteContext();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      ProgressPhotoService.getPhotosForDate(db, date).then((photos) => {
        if (!cancelled) {
          setCount(photos.length);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }, [db, date]),
  );

  return { count, loading };
}
