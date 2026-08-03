import { getExercisesByIds } from "@/lib/exercise-library/queries";
import type { WeightUnit } from "@/lib/exercise-library/types";
import { getRecentAiReports } from "@/lib/nightly-report/queries";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/** One completed session's record of a single exercise — the raw material every calculation below works from. */
export interface ExerciseHistoryEntry {
  session_id: string;
  completed_at: string;
  weight: number | null;
  weight_unit: WeightUnit | null;
  reps: number | null;
  sets_completed: number;
  sets_planned: number | null;
}

/** One entry in the "Recently Trained Exercises" picker — every strength exercise ever completed, not a capped recent list. */
export interface RecentExercise {
  exercise_id: string;
  name: string;
  default_unit: WeightUnit;
  last_completed_at: string;
}

export type TrendDirection = "up" | "down" | "flat";
export interface ExerciseTrend {
  direction: TrendDirection;
  delta_weight: number;
}

export interface PersonalRecords {
  max_weight: { value: number; unit: WeightUnit; session_id: string } | null;
  max_reps: { value: number; session_id: string } | null;
  /** Best single session's weight × reps × sets_completed — not summed across sessions, which would reward frequency over intensity. */
  max_volume: { value: number; session_id: string } | null;
}

export type RecommendationConfidence = "low" | "medium" | "high";
export interface WeightRecommendation {
  action: "increase" | "hold";
  next_weight: number | null;
  confidence: RecommendationConfidence;
  reason: string;
}

export interface ExerciseProgressSummary {
  exercise: RecentExercise;
  /** Newest first. */
  history: ExerciseHistoryEntry[];
  trend: ExerciseTrend | null;
  personal_records: PersonalRecords;
  recommendation: WeightRecommendation;
  insight: string;
}

/** Every distinct strength exercise ever completed, most recently trained first — deliberately unbounded, not a top-N recent list, so a user's full history is always browsable. */
export async function getRecentlyTrainedExercises(ctx?: AuthContext): Promise<RecentExercise[]> {
  const { supabase, user } = ctx ?? (await requireUser());

  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .select("id, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null);
  if (sessionsError) throw new Error(sessionsError.message);
  if (sessions.length === 0) return [];

  const completedAtBySessionId = new Map(sessions.map((session) => [session.id, session.completed_at as string]));

  const { data: rows, error: rowsError } = await supabase
    .from("workout_session_exercises")
    .select("exercise_id, session_id")
    .eq("user_id", user.id)
    .in(
      "session_id",
      sessions.map((session) => session.id),
    );
  if (rowsError) throw new Error(rowsError.message);
  if (rows.length === 0) return [];

  const exerciseIds = [...new Set(rows.map((row) => row.exercise_id))];
  const exercisesById = await getExercisesByIds(exerciseIds, { supabase, user });

  const lastCompletedByExercise = new Map<string, string>();
  for (const row of rows) {
    const completedAt = completedAtBySessionId.get(row.session_id);
    const exercise = exercisesById.get(row.exercise_id);
    if (!completedAt || !exercise || exercise.category !== "strength") continue;
    const current = lastCompletedByExercise.get(row.exercise_id);
    if (!current || completedAt > current) {
      lastCompletedByExercise.set(row.exercise_id, completedAt);
    }
  }

  return [...lastCompletedByExercise.entries()]
    .map(([exerciseId, lastCompletedAt]) => {
      const exercise = exercisesById.get(exerciseId)!;
      return {
        exercise_id: exerciseId,
        name: exercise.name,
        default_unit: exercise.default_unit,
        last_completed_at: lastCompletedAt,
      };
    })
    .sort((a, b) => b.last_completed_at.localeCompare(a.last_completed_at));
}

const EXERCISE_HISTORY_LIMIT = 100;

/** One exercise's full completed-session history, newest first — 100 comfortably covers months of even frequent training. Two-step fetch (sessions, then exercise rows for those sessions) rather than a nested-table filter/order, the same shape `getRecentlyTrainedExercises` above already uses. */
export async function getExerciseSessionHistory(
  exerciseId: string,
  ctx?: AuthContext,
): Promise<ExerciseHistoryEntry[]> {
  const { supabase, user } = ctx ?? (await requireUser());

  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .select("id, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(EXERCISE_HISTORY_LIMIT);
  if (sessionsError) throw new Error(sessionsError.message);
  if (sessions.length === 0) return [];

  const completedAtBySessionId = new Map(sessions.map((session) => [session.id, session.completed_at as string]));

  const { data: rows, error: rowsError } = await supabase
    .from("workout_session_exercises")
    .select("session_id, weight, weight_unit, reps, sets_completed, sets_planned")
    .eq("user_id", user.id)
    .eq("exercise_id", exerciseId)
    .in(
      "session_id",
      sessions.map((session) => session.id),
    );
  if (rowsError) throw new Error(rowsError.message);

  return rows
    .map((row) => ({
      session_id: row.session_id,
      completed_at: completedAtBySessionId.get(row.session_id)!,
      weight: row.weight,
      weight_unit: row.weight_unit as WeightUnit | null,
      reps: row.reps,
      sets_completed: row.sets_completed,
      sets_planned: row.sets_planned,
    }))
    .sort((a, b) => b.completed_at.localeCompare(a.completed_at));
}

const TREND_WINDOW = 3;
const FLAT_THRESHOLD = 0.5;
/** Matches the spec's own worked example ("4 sets of 15+ reps") — a fixed heuristic, not per-exercise configurable in v1. */
const HIGH_REP_THRESHOLD = 15;
const KG_INCREMENT = 1;
const LBS_INCREMENT = 5;
const RECENT_REPORTS_TO_SCAN = 5;

/**
 * Latest completed session vs. up to `TREND_WINDOW` sessions back —
 * deliberately simple, mirroring the weight-tracking trend elsewhere in
 * this app: not a smoothed average or a regression line, applied
 * per-session instead of per-calendar-day since workouts aren't daily.
 */
function computeTrend(history: ExerciseHistoryEntry[]): ExerciseTrend | null {
  const withWeight = history.filter((entry): entry is ExerciseHistoryEntry & { weight: number } => entry.weight !== null);
  if (withWeight.length < 2) return null;
  const latest = withWeight[0];
  const comparison = withWeight[Math.min(TREND_WINDOW - 1, withWeight.length - 1)];
  const deltaWeight = Number((latest.weight - comparison.weight).toFixed(1));
  const direction: TrendDirection = deltaWeight > FLAT_THRESHOLD ? "up" : deltaWeight < -FLAT_THRESHOLD ? "down" : "flat";
  return { direction, delta_weight: deltaWeight };
}

function computePersonalRecords(history: ExerciseHistoryEntry[]): PersonalRecords {
  let maxWeight: PersonalRecords["max_weight"] = null;
  let maxReps: PersonalRecords["max_reps"] = null;
  let maxVolume: PersonalRecords["max_volume"] = null;

  for (const entry of history) {
    if (entry.weight !== null && entry.weight_unit !== null) {
      if (!maxWeight || entry.weight > maxWeight.value) {
        maxWeight = { value: entry.weight, unit: entry.weight_unit, session_id: entry.session_id };
      }
    }
    if (entry.reps !== null) {
      if (!maxReps || entry.reps > maxReps.value) {
        maxReps = { value: entry.reps, session_id: entry.session_id };
      }
    }
    if (entry.weight !== null && entry.reps !== null) {
      const volume = entry.weight * entry.reps * entry.sets_completed;
      if (!maxVolume || volume > maxVolume.value) {
        maxVolume = { value: volume, session_id: entry.session_id };
      }
    }
  }

  return { max_weight: maxWeight, max_reps: maxReps, max_volume: maxVolume };
}

/**
 * Rule-based, computed entirely from local session history — never a
 * live AI call. Looks at the last three completed sessions: consistent
 * high reps at the same weight, sets fully completed, means "add weight
 * next time"; anything less consistent means "hold," and fewer than
 * three sessions means there isn't enough signal to recommend anything.
 */
function computeRecommendation(history: ExerciseHistoryEntry[], unit: WeightUnit): WeightRecommendation {
  const usable = history.filter((entry): entry is ExerciseHistoryEntry & { weight: number } => entry.weight !== null);
  if (usable.length < TREND_WINDOW) {
    return { action: "hold", next_weight: null, confidence: "low", reason: "Not enough session history yet" };
  }

  const last3 = usable.slice(0, TREND_WINDOW);
  const currentWeight = last3[0].weight;
  const sameWeight = last3.every((entry) => entry.weight === currentWeight);
  const setsComplete = last3.every((entry) => entry.sets_completed >= (entry.sets_planned ?? entry.sets_completed));
  const highReps = last3.every((entry) => entry.reps !== null && entry.reps >= HIGH_REP_THRESHOLD);

  if (sameWeight && setsComplete && highReps) {
    const increment = unit === "kg" ? KG_INCREMENT : LBS_INCREMENT;
    return {
      action: "increase",
      next_weight: Number((currentWeight + increment).toFixed(1)),
      confidence: "high",
      reason: "Target reps achieved consistently for 3 sessions",
    };
  }

  return {
    action: "hold",
    next_weight: currentWeight,
    confidence: "medium",
    reason: "Target reps not consistently completed",
  };
}

function formatWeight(value: number, unit: WeightUnit): string {
  return `${value}${unit}`;
}

/**
 * A natural-language summary computed from the same numbers already on
 * the page — always available, zero cost. `aiFeedbackHint`, when a
 * recent AI report happened to mention this exercise by name, is
 * prepended as a bonus, not relied on as the primary source (most
 * reports won't mention any specific exercise).
 */
function computeInsight(
  history: ExerciseHistoryEntry[],
  name: string,
  trend: ExerciseTrend | null,
  recommendation: WeightRecommendation,
  aiFeedbackHint?: string,
): string {
  const usable = history.filter(
    (entry): entry is ExerciseHistoryEntry & { weight: number; weight_unit: WeightUnit } =>
      entry.weight !== null && entry.weight_unit !== null,
  );
  if (usable.length === 0) {
    return `No completed sessions for ${name} yet.`;
  }

  const oldest = usable[usable.length - 1];
  const newest = usable[0];
  const unit = newest.weight_unit;

  const sentences: string[] = [];
  if (aiFeedbackHint) sentences.push(aiFeedbackHint);

  if (usable.length >= 2 && oldest.weight !== newest.weight) {
    sentences.push(
      `${name} moved from ${formatWeight(oldest.weight, unit)} to ${formatWeight(newest.weight, unit)} across ${usable.length} sessions.`,
    );
  } else {
    sentences.push(`${name} has been steady at ${formatWeight(newest.weight, unit)} across ${usable.length} sessions.`);
  }

  if (trend?.direction === "up") {
    sentences.push("Rep consistency is strong.");
  } else if (trend?.direction === "down") {
    sentences.push("Recent weight has dipped — worth checking recovery or form.");
  }

  if (recommendation.action === "increase" && recommendation.next_weight !== null) {
    sentences.push(`Ready to progress to ${formatWeight(recommendation.next_weight, unit)} next session.`);
  } else if (recommendation.confidence !== "low") {
    sentences.push("Hold at the current weight until reps are more consistent.");
  }

  return sentences.join(" ");
}

/** Best-effort scan of recent AI reports' coach summary for a mention of this exercise — a bonus signal, never the only source (see `computeInsight`). */
async function findAiFeedbackHint(exerciseName: string, ctx: AuthContext): Promise<string | undefined> {
  const reports = await getRecentAiReports(RECENT_REPORTS_TO_SCAN, ctx);
  const needle = exerciseName.toLowerCase();
  for (const report of reports) {
    if (report.parsed_json.coach_summary.toLowerCase().includes(needle)) {
      return report.parsed_json.coach_summary;
    }
  }
  return undefined;
}

export async function getExerciseProgressSummary(
  exercise: RecentExercise,
  ctx?: AuthContext,
): Promise<ExerciseProgressSummary> {
  const resolvedCtx = ctx ?? (await requireUser());
  const history = await getExerciseSessionHistory(exercise.exercise_id, resolvedCtx);
  const trend = computeTrend(history);
  const personalRecords = computePersonalRecords(history);
  const recommendation = computeRecommendation(history, exercise.default_unit);
  const aiFeedbackHint = await findAiFeedbackHint(exercise.name, resolvedCtx);
  const insight = computeInsight(history, exercise.name, trend, recommendation, aiFeedbackHint);

  return { exercise, history, trend, personal_records: personalRecords, recommendation, insight };
}
