import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { ProfileService, type ProfileTargets } from '../services';
import type { Profile, ProfileUpdate } from '../types';

export interface UseProfileResult {
  profile: Profile | null;
  targets: ProfileTargets | null;
  loading: boolean;
  refresh: () => void;
  updateProfile: (updates: ProfileUpdate) => Promise<void>;
}

/** Backs the Settings screen's Profile & Targets section — loads the profile plus every derived target together, and refreshes both after any field is saved (a goal/weight/height change can shift every target at once). */
export function useProfile(): UseProfileResult {
  const db = useSQLiteContext();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [targets, setTargets] = useState<ProfileTargets | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    ProfileService.getTargets(db).then((result) => {
      setProfile(result.profile);
      setTargets(result);
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateProfile = useCallback(
    async (updates: ProfileUpdate) => {
      await ProfileService.updateProfile(db, updates);
      refresh();
    },
    [db, refresh],
  );

  return { profile, targets, loading, refresh, updateProfile };
}
