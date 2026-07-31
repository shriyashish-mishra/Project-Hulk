import type { SessionExercise } from "./types";

// Rough, clearly-labeled estimates for the live "kcal est." tile and the
// figure stored on completion — not a validated MET-based formula, just
// enough to make the summary strip feel alive.
const CALORIES_PER_COMPLETED_SET = 5;
const CALORIES_PER_CARDIO_MINUTE = 6;

export function estimateCalories(exercises: SessionExercise[]): number {
  return Math.round(
    exercises.reduce((total, exercise) => {
      if (exercise.category === "cardio") {
        return total + (exercise.duration_minutes ?? 0) * CALORIES_PER_CARDIO_MINUTE;
      }
      return total + exercise.sets_completed * CALORIES_PER_COMPLETED_SET;
    }, 0),
  );
}
