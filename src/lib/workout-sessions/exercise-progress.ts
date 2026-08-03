import { getExerciseLibrary, getExercisesByIds } from "@/lib/exercise-library/queries";
import type { WeightUnit } from "@/lib/exercise-library/types";
import { getRecentAiReports } from "@/lib/nightly-report/queries";
import type { WorkoutExercise } from "@/lib/nightly-report/types";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/**
 * One completed session's (or one past AI report's) record of a single
 * exercise — the raw material every calculation below works from.
 * `source` distinguishes the two, since only session rows can be
 * clicked through to a session detail page.
 */
export interface ExerciseHistoryEntry {
  source: "session" | "report";
  session_id: string | null;
  report_date: string | null;
  completed_at: string;
  weight: number | null;
  weight_unit: WeightUnit | null;
  reps: number | null;
  sets_completed: number;
  sets_planned: number | null;
  /** The report's original free-text detail (e.g. "15 min @ 15% incline, 3kph") — shown as-is when no weight could be parsed out of it. */
  raw_detail: string | null;
}

/**
 * One entry in the "Recently Trained Exercises" picker — every strength
 * exercise ever completed in a session OR mentioned with a parseable
 * weight in a past AI report, not a capped recent list.
 * `exercise_id` is null for names that only ever appeared in a report
 * and were never added to the structured exercise library/templates.
 */
export interface RecentExercise {
  exercise_id: string | null;
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
  max_weight: { value: number; unit: WeightUnit } | null;
  max_reps: { value: number } | null;
  /** Best single session's weight × reps × sets_completed — not summed across sessions, which would reward frequency over intensity. */
  max_volume: { value: number } | null;
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

/**
 * Parses a report's free-text exercise detail for a weight, e.g.
 * `"16x4 @ 7.5kg alternating"` or `"1x12 @ 7.5kg + 3x10 @ 10kg"`. The
 * two numbers before "@" are ambiguous about which is reps and which is
 * sets (this text is AI-generated prose echoing however the user typed
 * it, not a fixed format) — reps is virtually always the larger of the
 * two in real training (5-30 reps vs. 1-6 sets), so the larger number is
 * taken as reps and the smaller as sets regardless of which order they
 * appear in. When multiple "+"-joined segments exist (a lighter warm-up
 * followed by working sets), the heaviest segment is kept as the
 * representative weight for that day. Returns `null` when no
 * weight-bearing segment is found (cardio/duration-based entries).
 */
function parseWorkoutDetail(detail: string): { reps: number; sets: number; weight: number; unit: WeightUnit } | null {
  const pattern = /(\d+)\s*x\s*(\d+)\s*@\s*(\d+(?:\.\d+)?)\s*(kgs?|lbs?)\b/gi;
  let best: { reps: number; sets: number; weight: number; unit: WeightUnit } | null = null;

  for (const match of detail.matchAll(pattern)) {
    const a = Number(match[1]);
    const b = Number(match[2]);
    const weight = Number(match[3]);
    const unit: WeightUnit = match[4].toLowerCase().startsWith("kg") ? "kg" : "lbs";
    const reps = Math.max(a, b);
    const sets = Math.min(a, b);
    if (!best || weight > best.weight) {
      best = { reps, sets, weight, unit };
    }
  }

  return best;
}

/** Comfortably covers years of nightly reports — "every report," not a meaningfully limiting cap. */
const ALL_REPORTS_LIMIT = 3650;

/** Every `workout_exercises` mention across every AI report, grouped by lowercased exercise name — the shared fetch both `getRecentlyTrainedExercises` and `getExerciseHistory` build on. */
async function getReportExerciseMentions(
  ctx: AuthContext,
): Promise<Map<string, Array<{ reportDate: string; exercise: WorkoutExercise }>>> {
  const reports = await getRecentAiReports(ALL_REPORTS_LIMIT, ctx);
  const byName = new Map<string, Array<{ reportDate: string; exercise: WorkoutExercise }>>();

  for (const report of reports) {
    const exercises = report.parsed_json.workout_exercises;
    if (!Array.isArray(exercises)) continue;
    for (const exercise of exercises) {
      const key = exercise.name.trim().toLowerCase();
      if (!byName.has(key)) byName.set(key, []);
      byName.get(key)!.push({ reportDate: report.report_date, exercise });
    }
  }

  return byName;
}

/** Every distinct strength exercise ever completed in a session or mentioned with a parseable weight in a report — deliberately unbounded, not a top-N recent list. */
export async function getRecentlyTrainedExercises(ctx?: AuthContext): Promise<RecentExercise[]> {
  const resolvedCtx = ctx ?? (await requireUser());
  const { supabase, user } = resolvedCtx;

  const byName = new Map<string, RecentExercise>();

  // Structured sessions first.
  const { data: sessions, error: sessionsError } = await supabase
    .from("workout_sessions")
    .select("id, completed_at")
    .eq("user_id", user.id)
    .not("completed_at", "is", null);
  if (sessionsError) throw new Error(sessionsError.message);

  if (sessions.length > 0) {
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

    const exerciseIds = [...new Set(rows.map((row) => row.exercise_id))];
    const exercisesById = await getExercisesByIds(exerciseIds, resolvedCtx);

    for (const row of rows) {
      const completedAt = completedAtBySessionId.get(row.session_id);
      const exercise = exercisesById.get(row.exercise_id);
      if (!completedAt || !exercise || exercise.category !== "strength") continue;
      const key = exercise.name.trim().toLowerCase();
      const existing = byName.get(key);
      if (!existing || completedAt > existing.last_completed_at) {
        byName.set(key, {
          exercise_id: exercise.id,
          name: exercise.name,
          default_unit: exercise.default_unit,
          last_completed_at: completedAt,
        });
      }
    }
  }

  // Then every report mention that has a parseable weight — including
  // exercise names that were never added to the structured library.
  const library = await getExerciseLibrary(resolvedCtx);
  const libraryByName = new Map(library.map((item) => [item.name.trim().toLowerCase(), item]));
  const reportMentions = await getReportExerciseMentions(resolvedCtx);

  for (const [key, mentions] of reportMentions) {
    for (const { reportDate, exercise } of mentions) {
      const parsed = exercise.detail ? parseWorkoutDetail(exercise.detail) : null;
      if (!parsed) continue;

      const libraryMatch = libraryByName.get(key);
      const completedAt = `${reportDate}T12:00:00`;
      const existing = byName.get(key);
      if (!existing || completedAt > existing.last_completed_at) {
        byName.set(key, {
          exercise_id: libraryMatch?.id ?? null,
          name: libraryMatch?.name ?? exercise.name,
          default_unit: libraryMatch?.default_unit ?? parsed.unit,
          last_completed_at: completedAt,
        });
      }
    }
  }

  return [...byName.values()].sort((a, b) => b.last_completed_at.localeCompare(a.last_completed_at));
}

const EXERCISE_HISTORY_LIMIT = 100;

/**
 * One exercise's full history, newest first, merging structured
 * completed sessions with parseable-weight mentions from past AI
 * reports — matched by exercise name (case-insensitive), since reports
 * only ever recorded a free-text name, never an `exercise_id`.
 */
export async function getExerciseHistory(exercise: RecentExercise, ctx?: AuthContext): Promise<ExerciseHistoryEntry[]> {
  const resolvedCtx = ctx ?? (await requireUser());
  const { supabase, user } = resolvedCtx;
  const entries: ExerciseHistoryEntry[] = [];

  if (exercise.exercise_id) {
    const { data: sessions, error: sessionsError } = await supabase
      .from("workout_sessions")
      .select("id, completed_at")
      .eq("user_id", user.id)
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(EXERCISE_HISTORY_LIMIT);
    if (sessionsError) throw new Error(sessionsError.message);

    if (sessions.length > 0) {
      const completedAtBySessionId = new Map(sessions.map((session) => [session.id, session.completed_at as string]));
      const { data: rows, error: rowsError } = await supabase
        .from("workout_session_exercises")
        .select("session_id, weight, weight_unit, reps, sets_completed, sets_planned")
        .eq("user_id", user.id)
        .eq("exercise_id", exercise.exercise_id)
        .in(
          "session_id",
          sessions.map((session) => session.id),
        );
      if (rowsError) throw new Error(rowsError.message);

      for (const row of rows) {
        entries.push({
          source: "session",
          session_id: row.session_id,
          report_date: null,
          completed_at: completedAtBySessionId.get(row.session_id)!,
          weight: row.weight,
          weight_unit: row.weight_unit as WeightUnit | null,
          reps: row.reps,
          sets_completed: row.sets_completed,
          sets_planned: row.sets_planned,
          raw_detail: null,
        });
      }
    }
  }

  const reportMentions = await getReportExerciseMentions(resolvedCtx);
  const mentions = reportMentions.get(exercise.name.trim().toLowerCase()) ?? [];
  for (const { reportDate, exercise: reportExercise } of mentions) {
    const parsed = reportExercise.detail ? parseWorkoutDetail(reportExercise.detail) : null;
    entries.push({
      source: "report",
      session_id: null,
      report_date: reportDate,
      completed_at: `${reportDate}T12:00:00`,
      weight: parsed?.weight ?? null,
      weight_unit: parsed?.unit ?? null,
      reps: parsed?.reps ?? null,
      sets_completed: parsed?.sets ?? 0,
      sets_planned: parsed?.sets ?? null,
      raw_detail: reportExercise.detail ?? null,
    });
  }

  return entries.sort((a, b) => b.completed_at.localeCompare(a.completed_at));
}

const TREND_WINDOW = 3;
const FLAT_THRESHOLD = 0.5;
/** Matches the spec's own worked example ("4 sets of 15+ reps") — a fixed heuristic, not per-exercise configurable in v1. */
const HIGH_REP_THRESHOLD = 15;
const KG_INCREMENT = 1;
const LBS_INCREMENT = 5;
const RECENT_REPORTS_TO_SCAN = 5;

/**
 * Latest entry vs. up to `TREND_WINDOW` entries back — deliberately
 * simple, mirroring the weight-tracking trend elsewhere in this app: not
 * a smoothed average or a regression line, applied per-entry instead of
 * per-calendar-day since workouts aren't daily.
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
        maxWeight = { value: entry.weight, unit: entry.weight_unit };
      }
    }
    if (entry.reps !== null) {
      if (!maxReps || entry.reps > maxReps.value) {
        maxReps = { value: entry.reps };
      }
    }
    if (entry.weight !== null && entry.reps !== null) {
      const volume = entry.weight * entry.reps * entry.sets_completed;
      if (!maxVolume || volume > maxVolume.value) {
        maxVolume = { value: volume };
      }
    }
  }

  return { max_weight: maxWeight, max_reps: maxReps, max_volume: maxVolume };
}

/**
 * Rule-based, computed entirely from local history (sessions and parsed
 * report mentions alike) — never a live AI call. Looks at the last three
 * entries: consistent high reps at the same weight, sets fully
 * completed, means "add weight next time"; anything less consistent
 * means "hold," and fewer than three entries means there isn't enough
 * signal to recommend anything.
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
  const history = await getExerciseHistory(exercise, resolvedCtx);
  const trend = computeTrend(history);
  const personalRecords = computePersonalRecords(history);
  const recommendation = computeRecommendation(history, exercise.default_unit);
  const aiFeedbackHint = await findAiFeedbackHint(exercise.name, resolvedCtx);
  const insight = computeInsight(history, exercise.name, trend, recommendation, aiFeedbackHint);

  return { exercise, history, trend, personal_records: personalRecords, recommendation, insight };
}
