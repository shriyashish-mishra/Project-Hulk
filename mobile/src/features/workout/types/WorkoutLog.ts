/**
 * One entry per day. Deliberately lightweight — a type, a duration, and
 * a free-text note, not a full sets/reps/weight tracker. That's future
 * workout-planner territory, not this phase.
 */
export interface WorkoutLog {
  id: number;
  loggedOn: string;
  workoutType: string | null;
  durationMinutes: number | null;
  notes: string;
  createdAt: string;
}
