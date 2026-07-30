import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { CycleService } from '../services';

export interface UseCycleSettingsResult {
  enabled: boolean;
  loading: boolean;
  setEnabled: (enabled: boolean) => Promise<void>;
}

/** The opt-in toggle — off by default, lives in Settings, never on Home. */
export function useCycleSettings(): UseCycleSettingsResult {
  const db = useSQLiteContext();
  const [enabled, setEnabledState] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    CycleService.isEnabled(db).then((value) => {
      if (!cancelled) {
        setEnabledState(value);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [db]);

  const setEnabled = useCallback(
    async (value: boolean) => {
      await CycleService.setEnabled(db, value);
      setEnabledState(value);
    },
    [db],
  );

  return { enabled, loading, setEnabled };
}
