import { formatDuration } from "@/lib/date";
import type { PrimaryGoal } from "@/lib/profile/types";

/** Short, deterministic scene-setters — one line, not a paragraph. The fuller synthesis lives in the Coach sections below. */

/**
 * One line naming what actually matters for this user's goal — operationalizes
 * the brief's per-goal emphasis list without rewriting every section's wording.
 * Returns null with no goal set yet, so the caller can simply omit the line.
 */
export function buildGoalContextSentence(goal: PrimaryGoal | null): string | null {
  switch (goal) {
    case "lose_fat":
      return "For fat loss, the story worth watching is protein, training consistency, and the longer-term weight trend — not any single day.";
    case "build_muscle":
      return "For building muscle, training consistency and recovery matter more than the scale — progression is the real signal.";
    case "recomposition":
      return "For recomposition, expect the scale to stay quiet while training quality and photos tell the real story.";
    case "maintain":
      return "For maintaining, consistency itself is the win — steady habits matter more than any single number.";
    default:
      return null;
  }
}

export function buildWeeklyHeadline(workoutsCompleted: number, recoveryGood: boolean): string {
  if (workoutsCompleted >= 5 && recoveryGood) return "A strong, well-recovered week.";
  if (workoutsCompleted >= 5) return "A high-training week.";
  if (workoutsCompleted <= 1) return "A lighter week.";
  return "A steady week.";
}

export function buildMonthlyHeadline(consistencyPct: number, avgWorkoutScoreImproved: boolean): string {
  if (consistencyPct >= 80) return "A month of strong consistency.";
  if (consistencyPct >= 60) return "A month of steady progress.";
  if (avgWorkoutScoreImproved) return "A month of building momentum.";
  return "A month of finding your rhythm.";
}

/** Combines a training fact with the single most notable recovery insight, matching the "training X, but sleep Y" pattern. */
export function buildWeeklyStorySentence(
  workoutsCompleted: number,
  previousWorkoutsCompleted: number,
  recoveryInsights: string[],
): string {
  const trainingClause =
    workoutsCompleted === previousWorkoutsCompleted
      ? `You matched last week with ${workoutsCompleted} workout${workoutsCompleted === 1 ? "" : "s"}`
      : workoutsCompleted > previousWorkoutsCompleted
        ? `Training volume increased to ${workoutsCompleted} workouts this week`
        : `Training volume eased to ${workoutsCompleted} workouts this week`;

  if (recoveryInsights.length === 0) {
    return `${trainingClause}.`;
  }
  return `${trainingClause}, and ${recoveryInsights[0].charAt(0).toLowerCase()}${recoveryInsights[0].slice(1, -1)}.`;
}

/** Nutrition + sleep told as one story, not two unrelated dashboards — for Monthly's "Habits Supporting It" section. */
export function buildHabitsSentence(params: {
  avgProteinG: number | null;
  previousAvgProteinG: number | null;
  avgSleepMinutes: number | null;
  previousAvgSleepMinutes: number | null;
}): string {
  const { avgProteinG, previousAvgProteinG, avgSleepMinutes, previousAvgSleepMinutes } = params;
  const clauses: string[] = [];

  if (avgProteinG !== null) {
    if (previousAvgProteinG !== null && avgProteinG - previousAvgProteinG >= 5) {
      clauses.push("protein improved throughout the month");
    } else if (previousAvgProteinG !== null && previousAvgProteinG - avgProteinG >= 5) {
      clauses.push("protein intake slipped compared to last month");
    } else {
      clauses.push(`protein averaged ${avgProteinG}g`);
    }
  }

  if (avgSleepMinutes !== null) {
    if (previousAvgSleepMinutes !== null && avgSleepMinutes - previousAvgSleepMinutes >= 15) {
      clauses.push("sleep became more consistent");
    } else if (previousAvgSleepMinutes !== null && previousAvgSleepMinutes - avgSleepMinutes >= 15) {
      clauses.push("sleep dropped off");
    } else {
      clauses.push(`sleep averaged ${formatDuration(avgSleepMinutes)}`);
    }
  }

  if (clauses.length === 0) {
    return "Not enough nutrition or sleep data yet to tell this part of the story.";
  }
  const joined = clauses.join(", while ");
  return `${joined.charAt(0).toUpperCase()}${joined.slice(1)}.`;
}
