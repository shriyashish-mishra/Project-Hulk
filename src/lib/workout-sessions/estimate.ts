import type { SessionExercise } from "./types";

// Fallback only — used per-exercise when its MET hasn't been classified
// yet (see exercise-library/met.ts) or the user's bodyweight isn't known.
// Same flat, clearly-labeled placeholder this file always used: not a
// validated formula, just enough to avoid showing nothing.
const CALORIES_PER_COMPLETED_SET = 5;
const CALORIES_PER_CARDIO_MINUTE = 6;

// Standard ACSM formula: kcal/min = MET x 3.5 x bodyweight(kg) / 200.
const ACSM_ML_O2_PER_KG_PER_MET = 3.5;
const ACSM_ML_O2_TO_KCAL_DIVISOR = 200;

// A completed strength set isn't logged with a duration the way cardio
// is, so the MET formula (which needs time) needs one assumed from reps —
// ~3 seconds of time-under-load per rep is a reasonable controlled-tempo
// estimate, same spirit as the assumed casual walking pace behind
// calculateKcalPer1000Steps (profile/targets.ts). Falls back to a modest
// 10-rep assumption when reps weren't logged for that set.
const SECONDS_PER_REP_ESTIMATE = 3;
const DEFAULT_REPS_ASSUMPTION = 10;

function metKcal(metValue: number, bodyweightKg: number, minutes: number): number {
  return (metValue * ACSM_ML_O2_PER_KG_PER_MET * bodyweightKg) / ACSM_ML_O2_TO_KCAL_DIVISOR * minutes;
}

/**
 * `bodyweightKg` — when known — lets every exercise with a cached
 * `met_value` (see exercise-library/met.ts) use the real ACSM MET formula
 * instead of the flat per-set/per-minute placeholder, scaled by this
 * specific exercise's actual completed sets/reps/duration. An exercise
 * without a cached MET yet, or a null bodyweight, falls back to the flat
 * figure for just that exercise — never blocks or zeroes out the rest of
 * the estimate.
 */
export function estimateCalories(exercises: SessionExercise[], bodyweightKg: number | null): number {
  return Math.round(
    exercises.reduce((total, exercise) => {
      if (exercise.category === "cardio") {
        // Cardio rows use sets_completed as a single 0|1 completion toggle,
        // not a real set count (see workout_session_exercises' own schema
        // comment) — gate on it the same way strength sets already are
        // below, so a template's planned duration doesn't get counted the
        // instant a session starts, before anything's actually been done.
        if (exercise.sets_completed <= 0) return total;
        if (exercise.met_value != null && bodyweightKg != null) {
          return total + metKcal(exercise.met_value, bodyweightKg, exercise.duration_minutes ?? 0);
        }
        return total + (exercise.duration_minutes ?? 0) * CALORIES_PER_CARDIO_MINUTE;
      }

      if (exercise.met_value != null && bodyweightKg != null) {
        const repsPerSet = exercise.reps ?? DEFAULT_REPS_ASSUMPTION;
        const minutesPerSet = (repsPerSet * SECONDS_PER_REP_ESTIMATE) / 60;
        return total + exercise.sets_completed * metKcal(exercise.met_value, bodyweightKg, minutesPerSet);
      }
      return total + exercise.sets_completed * CALORIES_PER_COMPLETED_SET;
    }, 0),
  );
}
