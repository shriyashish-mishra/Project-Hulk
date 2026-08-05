import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { PresetService } from '../services';
import type { Preset } from '../types';

export interface UsePresetsResult {
  presets: Preset[];
  loading: boolean;
  create: (rawText: string) => Promise<Preset>;
  update: (id: number, rawText: string) => Promise<Preset>;
  remove: (id: number) => Promise<void>;
}

export function useFoodPresets(): UsePresetsResult {
  const db = useSQLiteContext();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    PresetService.listFood(db).then((result) => {
      setPresets(result);
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (rawText: string) => {
      const created = await PresetService.createFood(db, rawText);
      setPresets((prev) => [...prev, created]);
      return created;
    },
    [db],
  );

  const update = useCallback(
    async (id: number, rawText: string) => {
      const updated = await PresetService.updateFood(db, id, rawText);
      setPresets((prev) => prev.map((preset) => (preset.id === id ? updated : preset)));
      return updated;
    },
    [db],
  );

  const remove = useCallback(
    async (id: number) => {
      await PresetService.deleteFood(db, id);
      setPresets((prev) => prev.filter((preset) => preset.id !== id));
    },
    [db],
  );

  return { presets, loading, create, update, remove };
}

export function useWorkoutPresets(): UsePresetsResult {
  const db = useSQLiteContext();
  const [presets, setPresets] = useState<Preset[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    PresetService.listWorkout(db).then((result) => {
      setPresets(result);
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const create = useCallback(
    async (rawText: string) => {
      const created = await PresetService.createWorkout(db, rawText);
      setPresets((prev) => [...prev, created]);
      return created;
    },
    [db],
  );

  const update = useCallback(
    async (id: number, rawText: string) => {
      const updated = await PresetService.updateWorkout(db, id, rawText);
      setPresets((prev) => prev.map((preset) => (preset.id === id ? updated : preset)));
      return updated;
    },
    [db],
  );

  const remove = useCallback(
    async (id: number) => {
      await PresetService.deleteWorkout(db, id);
      setPresets((prev) => prev.filter((preset) => preset.id !== id));
    },
    [db],
  );

  return { presets, loading, create, update, remove };
}
