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
// is, and reps-implied time (an earlier version of this file assumed
// ~3 seconds per rep) still made the estimate depend on something never
// actually measured — every set counted as more or less "time" without
// the app ever knowing a real tempo. Flat per set instead: sets_completed
// is the one thing actually logged and countable, so it's the only input
// here. FIXED_MINUTES_PER_SET is a single calibration constant (not a
// per-rep or per-set duration claim) chosen so the output lands in the
// same ballpark as the flat fallback below, now scaled by MET and
// bodyweight instead of being the same number for every exercise.
const FIXED_MINUTES_PER_SET = 0.75;

function metKcal(metValue: number, bodyweightKg: number, minutes: number): number {
  return (metValue * ACSM_ML_O2_PER_KG_PER_MET * bodyweightKg) / ACSM_ML_O2_TO_KCAL_DIVISOR * minutes;
}

/**
 * `bodyweightKg` — when known — lets every exercise with a cached
 * `met_value` (see exercise-library/met.ts) use the real ACSM MET formula
 * instead of the flat per-set/per-minute placeholder, scaled by this
 * specific exercise's actual completed sets (strength) or logged duration
 * (cardio) — never anything not actually logged, like an assumed rep
 * tempo or the session's own elapsed time. An exercise without a cached
 * MET yet, or a null bodyweight, falls back to the flat figure for just
 * that exercise — never blocks or zeroes out the rest of the estimate.
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
        return total + exercise.sets_completed * metKcal(exercise.met_value, bodyweightKg, FIXED_MINUTES_PER_SET);
      }
      return total + exercise.sets_completed * CALORIES_PER_COMPLETED_SET;
    }, 0),
  );
}
