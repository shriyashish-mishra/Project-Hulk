import type { ExerciseLibraryItem } from '@/features/exercise-library/types';
import type { TemplateExerciseInput } from '@/features/workout-templates/types';

/**
 * Same block shape `parsePresetExercises` already reads (name line, then
 * detail lines) — so an exercise added through the structured picker
 * displays identically to one typed by hand or picked from a saved
 * preset. Ported 1:1 from the web app's Journal workout drawer, reusing
 * `ExerciseEntrySheet`'s `TemplateExerciseInput` field values directly
 * rather than inventing a second shape for "a logged exercise."
 */
export function formatExerciseBlock(exercise: ExerciseLibraryItem, input: TemplateExerciseInput): string {
  const lines = [exercise.name];
  if (exercise.category === 'cardio') {
    if (input.defaultDurationMinutes != null) lines.push(`${input.defaultDurationMinutes} min`);
    const conditions = [
      input.defaultInclinePercent != null ? `${input.defaultInclinePercent}% incline` : null,
      input.defaultSpeedKph != null ? `${input.defaultSpeedKph}kph` : null,
    ].filter((part): part is string => part !== null);
    if (conditions.length > 0) lines.push(conditions.join(', '));
  } else {
    if (input.defaultWeight != null) lines.push(`${input.defaultWeight}${input.defaultWeightUnit ?? exercise.defaultUnit}`);
    if (input.defaultSets != null && input.defaultReps != null) lines.push(`${input.defaultSets} x ${input.defaultReps}`);
  }
  if (input.notes) lines.push(input.notes);
  return lines.join('\n');
}
