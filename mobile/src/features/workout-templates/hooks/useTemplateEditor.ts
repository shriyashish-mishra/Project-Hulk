import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { WorkoutTemplateService } from '../services';
import type { TemplateExerciseInput, WorkoutTemplateWithExercises } from '../types';

export interface UseTemplateEditorResult {
  template: WorkoutTemplateWithExercises | null;
  loading: boolean;
  refresh: () => void;
  renameTemplate: (name: string) => Promise<void>;
  addExercise: (exerciseId: number, input: TemplateExerciseInput) => Promise<void>;
  updateExercise: (templateExerciseId: number, input: TemplateExerciseInput) => Promise<void>;
  removeExercise: (templateExerciseId: number) => Promise<void>;
  moveExercise: (templateExerciseId: number, direction: 'up' | 'down') => Promise<void>;
}

/** Backs the Template Editor screen — one template plus every mutation its exercise list can trigger, all re-fetching the whole template afterward so the ordered list always reflects the database exactly. */
export function useTemplateEditor(templateId: number): UseTemplateEditorResult {
  const db = useSQLiteContext();
  const [template, setTemplate] = useState<WorkoutTemplateWithExercises | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    WorkoutTemplateService.getTemplate(db, templateId).then((result) => {
      setTemplate(result);
      setLoading(false);
    });
  }, [db, templateId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const renameTemplate = useCallback(
    async (name: string) => {
      await WorkoutTemplateService.renameTemplate(db, templateId, name);
      refresh();
    },
    [db, templateId, refresh],
  );

  const addExercise = useCallback(
    async (exerciseId: number, input: TemplateExerciseInput) => {
      await WorkoutTemplateService.addExercise(db, templateId, exerciseId, input);
      refresh();
    },
    [db, templateId, refresh],
  );

  const updateExercise = useCallback(
    async (templateExerciseId: number, input: TemplateExerciseInput) => {
      await WorkoutTemplateService.updateExercise(db, templateExerciseId, input);
      refresh();
    },
    [db, refresh],
  );

  const removeExercise = useCallback(
    async (templateExerciseId: number) => {
      await WorkoutTemplateService.removeExercise(db, templateExerciseId);
      refresh();
    },
    [db, refresh],
  );

  const moveExercise = useCallback(
    async (templateExerciseId: number, direction: 'up' | 'down') => {
      await WorkoutTemplateService.moveExercise(db, templateId, templateExerciseId, direction);
      refresh();
    },
    [db, templateId, refresh],
  );

  return { template, loading, refresh, renameTemplate, addExercise, updateExercise, removeExercise, moveExercise };
}
