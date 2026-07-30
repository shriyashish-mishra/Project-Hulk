import type { SessionExercise } from '../types';

/**
 * "alternating" is read straight from the exercise's own notes — the same
 * word the template's Notes field already carries — so there's nothing new
 * for the user to configure to get it into the generated text.
 */
function formatStrengthLine(exercise: SessionExercise): string {
  const modifier = exercise.notes?.toLowerCase().includes('alternating') ? ' alternating' : '';
  return `${exercise.exerciseName} ${exercise.weight}${exercise.weightUnit}${modifier} ${exercise.reps}*${exercise.setsCompleted}`;
}

function formatCardioLine(exercise: SessionExercise): string {
  return `${exercise.durationMinutes} mins ${exercise.exerciseName.toLowerCase()} ${exercise.inclinePercent} degrees ${exercise.speedKph}kph`;
}

/**
 * Turns a completed session's rows into the exact free-text convention
 * `workout_logs.raw_text` already stores — this function, and the single
 * upsert call that uses its output, is the entire integration surface with
 * the AI report pipeline. Exercises that were never actually done (zero
 * completed sets, or a cardio entry with no duration) are left out rather
 * than logged as if performed.
 */
export function buildCanonicalWorkoutText(templateName: string, exercises: SessionExercise[]): string {
  const lines = exercises
    .filter((exercise) =>
      exercise.category === 'cardio' ? exercise.durationMinutes != null : exercise.setsCompleted > 0,
    )
    .map((exercise) => (exercise.category === 'cardio' ? formatCardioLine(exercise) : formatStrengthLine(exercise)));

  return [templateName, '', ...lines].join('\n');
}
