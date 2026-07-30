import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { WorkoutTemplateService } from '../services';
import type { WorkoutTemplate } from '../types';

export interface UseWorkoutTemplatesResult {
  templates: WorkoutTemplate[];
  loading: boolean;
  refresh: () => void;
  createTemplate: (name: string) => Promise<WorkoutTemplate>;
}

/** Backs the templates list screen — most-recently-updated first, same ordering the repository query already applies. */
export function useWorkoutTemplates(): UseWorkoutTemplatesResult {
  const db = useSQLiteContext();
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    WorkoutTemplateService.listTemplates(db).then((items) => {
      setTemplates(items);
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTemplate = useCallback(
    async (name: string) => {
      const template = await WorkoutTemplateService.createTemplate(db, name);
      refresh();
      return template;
    },
    [db, refresh],
  );

  return { templates, loading, refresh, createTemplate };
}
