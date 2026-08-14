import { MEAL_SECTIONS } from "@/lib/food-logs/constants";
import type { FoodLog, MealType } from "@/lib/food-logs/types";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import type { SleepLog } from "@/lib/sleep/types";
import type { WaterLog } from "@/lib/water/types";
import type { WeightLog } from "@/lib/weight/types";
import type { PhotoViewType } from "@/lib/photos/types";
import type { UserContext } from "@/lib/profile/context";
import {
  ACTIVITY_LEVEL_LABEL,
  PRIMARY_GOAL_LABEL,
  TRAINING_FREQUENCY_LABEL,
} from "@/lib/profile/types";
import { formatDuration } from "@/lib/date";
import { CYCLE_PHASE_LABEL } from "@/lib/cycle/types";
import type { WeekSoFarContext } from "./week-context";
import { AI_REPORT_JSON_EXAMPLE } from "./constants";

interface PriorWeightContext {
  log: WeightLog;
  daysAgo: number;
}

interface BuildPromptInput {
  date: string;
  foodLogs: FoodLog[];
  workoutLog: WorkoutLog | null;
  waterLog: WaterLog | null;
  sleepLog: SleepLog | null;
  weightLog: WeightLog | null;
  priorWeight: PriorWeightContext | null;
  photoViewsCaptured: PhotoViewType[];
  photoComparisonNote: string | null;
  userContext: UserContext;
  weekSoFar: WeekSoFarContext;
}

/**
 * Deterministic weekly rollup (Monday up to, but not including, today) so
 * suggestions build on the week's actual pattern instead of treating each
 * night as if it started from zero — and so the same week produces the same
 * context regardless of which AI reads it. Today's own data is detailed
 * separately above; this section is strictly what happened earlier.
 */
function buildWeekSoFarMarkdown(week: WeekSoFarContext): string {
  if (week.daysWithReports === 0) {
    return `Today is ${week.weekdayLabel}, the first reported day this week — no earlier context yet.`;
  }

  const lines: string[] = [
    `Today is ${week.weekdayLabel}. ${week.daysWithReports} earlier day(s) reported this week, ${week.daysRemainingInWeek} day(s) left after today.`,
    `Workouts so far this week: ${week.workoutsCompleted}, rest days: ${week.restDays}.`,
  ];
  if (week.trainedRegionLabels.length > 0) {
    lines.push(`Already trained this week: ${week.trainedRegionLabels.join(", ")}.`);
  }
  if (week.untrainedRegionLabels.length > 0) {
    lines.push(`Not yet trained this week: ${week.untrainedRegionLabels.join(", ")}.`);
  }
  if (week.avgProteinG !== null) lines.push(`Avg protein/day so far this week: ${week.avgProteinG}g.`);
  if (week.avgCalories !== null) lines.push(`Avg calories/day so far this week: ${week.avgCalories} kcal.`);

  return lines.join("\n");
}

/** Structured facts about who's asking — the AI interprets them, it never has to guess or ask what the user's goal is. */
function buildAboutMeMarkdown(userContext: UserContext): string {
  const { profile, proteinTargetG, calorieRangeKcal, carbsTargetG, fatTargetG, fiberTargetG } = userContext;
  if (!profile) return "Not provided yet.";

  const lines: string[] = [];
  if (profile.primary_goal) lines.push(`Goal: ${PRIMARY_GOAL_LABEL[profile.primary_goal]}`);
  if (profile.training_frequency) {
    lines.push(`Usual training frequency: ${TRAINING_FREQUENCY_LABEL[profile.training_frequency]}`);
  }
  if (profile.activity_level) {
    lines.push(`Activity level outside training: ${ACTIVITY_LEVEL_LABEL[profile.activity_level]}`);
  }
  if (proteinTargetG) lines.push(`Protein target: ${proteinTargetG}g/day`);
  if (calorieRangeKcal) lines.push(`Calorie range: ${calorieRangeKcal.min}–${calorieRangeKcal.max} kcal/day`);
  if (carbsTargetG) lines.push(`Carb target: ${carbsTargetG}g/day`);
  if (fatTargetG) lines.push(`Fat target: ${fatTargetG}g/day`);
  if (fiberTargetG) lines.push(`Fibre target: ${fiberTargetG}g/day`);
  if (profile.target_weight_kg) lines.push(`Target weight: ${profile.target_weight_kg} kg`);

  return lines.length > 0 ? lines.join("\n") : "Not provided yet.";
}

/** Entirely opt-in — only present when the user chose to share it. Never shown, never inferred, when absent. */
function buildCycleContextMarkdown(cycleEstimate: UserContext["cycleEstimate"]): string {
  if (!cycleEstimate) return "";
  return `## Cycle Context (optional, for gentle training-intensity awareness only)

Day ${cycleEstimate.cycleDay} of ~${cycleEstimate.cycleLengthDays} · ${CYCLE_PHASE_LABEL[cycleEstimate.phase]} phase

`;
}

function buildPhotosLine(
  photoViewsCaptured: PhotoViewType[],
  photoComparisonNote: string | null,
): string {
  if (photoViewsCaptured.length === 0) return "Progress photos: Not captured today";

  const captured = `Progress photos: captured today (${photoViewsCaptured.join(", ")})`;
  if (!photoComparisonNote) return `${captured} — for my own tracking, not for you to view`;

  return `${captured}. AI vision comparison against my most recent prior photo of each view — factor this into strengths/improvements/coach_summary where relevant:\n${photoComparisonNote}`;
}

function buildRecoveryContextMarkdown({
  waterLog,
  sleepLog,
  weightLog,
  priorWeight,
  photoViewsCaptured,
  photoComparisonNote,
}: Pick<
  BuildPromptInput,
  "waterLog" | "sleepLog" | "weightLog" | "priorWeight" | "photoViewsCaptured" | "photoComparisonNote"
>): string {
  const waterLine = waterLog
    ? `Water: ${waterLog.glass_count} of ${waterLog.target_glasses} glasses (${((waterLog.glass_count * waterLog.glass_size_ml) / 1000).toFixed(1)} L)`
    : "Water: Not logged";

  const sleepLine = sleepLog
    ? `Sleep: ${formatDuration(sleepLog.duration_minutes)} of ${formatDuration(sleepLog.target_minutes)} target`
    : "Sleep: Not logged";

  let weightLine: string;
  if (weightLog) {
    weightLine = `Weight: ${Number(weightLog.weight_kg)} kg (logged today, for long-term tracking only)`;
  } else if (priorWeight) {
    const label =
      priorWeight.daysAgo === 1 ? "1 day ago" : `${priorWeight.daysAgo} days ago`;
    weightLine = `Weight: ${Number(priorWeight.log.weight_kg)} kg (most recent, logged ${label} on ${priorWeight.log.measured_on}, for long-term tracking only)`;
  } else {
    weightLine = "Weight: Not logged recently";
  }

  const photosLine = buildPhotosLine(photoViewsCaptured, photoComparisonNote);

  return [waterLine, sleepLine, weightLine, photosLine].join("\n");
}

export function buildNightlyReportPrompt({
  date,
  foodLogs,
  workoutLog,
  waterLog,
  sleepLog,
  weightLog,
  priorWeight,
  photoViewsCaptured,
  photoComparisonNote,
  userContext,
  weekSoFar,
}: BuildPromptInput): string {
  const foodByMeal = new Map<MealType, string>();
  for (const log of foodLogs) foodByMeal.set(log.meal_type, log.raw_text);

  const mealsMarkdown = MEAL_SECTIONS.map(
    (section) =>
      `${section.label}\n${foodByMeal.get(section.type) ?? "Not logged"}`,
  ).join("\n\n");

  const workoutMarkdown = workoutLog?.raw_text ?? "Not logged";

  const recoveryContextMarkdown = buildRecoveryContextMarkdown({
    waterLog,
    sleepLog,
    weightLog,
    priorWeight,
    photoViewsCaptured,
    photoComparisonNote,
  });

  return `# Project Hulk

Date:
${date}

## Today's Meals

${mealsMarkdown}

## Today's Workout

${workoutMarkdown}

## This Week So Far

${buildWeekSoFarMarkdown(weekSoFar)}

${buildCycleContextMarkdown(userContext.cycleEstimate)}## Hydration, Sleep & Weight

${recoveryContextMarkdown}

## About Me

${buildAboutMeMarkdown(userContext)}

---

Please estimate:

- Calories
- Protein
- Fat
- Carbohydrates
- Fibre
- Micronutrients — check at least 3-4 that are actually relevant to
  today's log (protein/iron/calcium/vitamin-D-type staples are usually
  worth checking regardless of what else was eaten), each with a note
  naming the specific food(s) that covered it, or the specific gap if
  it didn't — "adequate" or "low" with no note is not useful on its own
- Estimated calorie deficit/surplus, as both a sentence and a signed kcal number (negative = deficit)
- From the workout log: duration in minutes, total calories burned, and the individual exercises with sets/reps if mentioned, each with its own best-effort calories-burned estimate ("calories_burned" per exercise — leave it off an exercise, or leave the exercise out entirely, if the log genuinely doesn't support a guess; the per-exercise numbers don't need to add up exactly to the workout total, both are independent estimates)

Then analyse — weighed against my goal, targets, and training frequency
under "About Me" above, not generic advice:

- Nutrition quality
- Workout quality
- Recovery — a 0-100 assessment of how well-recovered I likely am. Weigh CUMULATIVE training load across "This Week So Far" above — workouts already completed, rest days taken — alongside today's hydration and sleep versus their targets, not just today's session in isolation. A demanding week already logged should pull this down even when today's own numbers look fine, the same way a real coach factors in accumulated fatigue, not just today's snapshot. Not a biometric reading, a coaching judgment — and explain the actual reasoning behind the number in recovery_note, not a restatement of the score.
- Muscle groups trained
- What I did well — name the actual food, exercise, or pattern each
  point is about, not a generic category label ("high protein" on its
  own is weak; "protein cleared target from whole-food sources — eggs,
  chicken, dal" is the bar). On a normal day this usually means 4-5
  points, not 2 — a short list is a signal to look harder at what's
  already in the logs above before concluding there's little to say
- What I could improve — same specificity, same bar on count. On a rest
  day with minimal training to comment on, this can lean more on
  nutrition/recovery detail instead, but should still reach a similar
  count, not shrink because there's no workout to discuss
- Suggested meals tomorrow — informed by this week's protein/calorie pattern under "This Week So Far" above, not just today's numbers in isolation
- Suggested workout tomorrow, both as a sentence and as a specific exercise list with sets/reps — prioritize whatever's listed as "Not yet trained this week" while training days remain in the week, rather than repeating what's already been trained. If "Cycle Context" is provided above, let it gently inform intensity/volume only (e.g. a lower-intensity or recovery-leaning session may suit menstrual or late-luteal days better for some people) — never change exercise selection rigidly because of it, never offer medical commentary, and simply ignore this entirely if no cycle context is given

IMPORTANT:

- Weight is logged for my own long-term tracking only, never as a daily
  performance signal. It must NOT influence nutrition_score,
  workout_score, recovery_score, or overall_score — base those four on
  today's food, training, hydration, and sleep. The one deliberate
  exception is recovery_score, which should also weigh cumulative
  training load from "This Week So Far" as described above — that's
  about accumulated training fatigue, not weight, so it's not excluded
  by this rule.
- Judge workout_score only on the quality and effort of what I actually
  trained today (e.g. an arms-and-shoulders session should be scored as
  an arms-and-shoulders session, not marked down for skipping legs). No
  single day is expected to hit every muscle group — whether my training
  is balanced across muscle groups is a weekly/monthly question, never a
  daily one, so don't factor muscle-group coverage into today's score.
- For machine/cable exercises specifically (lat pulldown, machine row,
  face pull, tricep pushdown, and anything else clearly done on a
  machine or cable stack) always report the weight unit as lbs in
  workout_exercises detail, even if my log says kg for that exercise —
  I only ever mean lbs there, regardless of what unit I typed. Leave
  every dumbbell and barbell weight exactly as I logged it, unit and
  all — this rule is only for machine/cable exercises.
- coach_summary and recovery_note should read like an actual coach's
  takeaway, not a generic one-liner: 2-4 sentences that synthesize
  today's nutrition, training, and recovery together and connect them to
  the week's pattern where it's relevant (e.g. "third session this week
  after only one rest day" matters more than restating today's numbers
  alone). Specific and situational beats generic every time — write the
  reasoning, not just the verdict.

Return TWO outputs:

1. A beautiful markdown report.
2. A structured JSON object inside a \`\`\`json code block, matching exactly this shape (scores are integers 0-100, dates are YYYY-MM-DD):

\`\`\`json
${JSON.stringify(AI_REPORT_JSON_EXAMPLE, null, 2)}
\`\`\`

Only the JSON block will be imported back into the app — make sure it is valid, complete JSON with no trailing commas or comments.
`;
}
