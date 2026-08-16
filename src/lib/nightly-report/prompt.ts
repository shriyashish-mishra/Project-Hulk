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
import { calculateBMR, calculateRestingExpenditureKcal } from "@/lib/profile/targets";
import { CYCLE_PHASE_LABEL } from "@/lib/cycle/types";
import type { WeekSoFarContext } from "./week-context";
import type { RecentCalorieBalance } from "./calorie-history";
import { AI_REPORT_JSON_EXAMPLE } from "./constants";

interface PriorWeightContext {
  log: WeightLog;
  daysAgo: number;
}

interface BuildPromptInput {
  date: string;
  foodLogs: FoodLog[];
  workoutLog: WorkoutLog | null;
  /**
   * Deterministic non-workout-steps calorie figure, when steps were
   * logged and weight/height are known — computed by the caller via
   * `calculateStepsCaloriesBurned`, never left for the AI to infer from
   * free text (see that function's doc for why). `null` when no steps
   * were logged today, distinct from "logged as 0."
   */
  stepsCaloriesBurned: { steps: number; caloriesBurned: number } | null;
  waterLog: WaterLog | null;
  sleepLog: SleepLog | null;
  weightLog: WeightLog | null;
  priorWeight: PriorWeightContext | null;
  photoViewsCaptured: PhotoViewType[];
  photoComparisonNote: string | null;
  userContext: UserContext;
  weekSoFar: WeekSoFarContext;
  recentCalorieBalances: RecentCalorieBalance[];
  /**
   * Whether to ask for the prose markdown report alongside the JSON block.
   * Only the manual Claude-copy-paste path has a human actually reading
   * that markdown in the chat before importing — every automated caller
   * (cron, on-demand button, MCP) only ever parses the JSON block and
   * discards the rest, so asking for it there is pure wasted generation
   * time. Measured impact: ~56% of a typical response is the markdown
   * portion, and it's the dominant factor in how long generation takes.
   * Defaults to true so existing callers that don't pass it keep the
   * behavior they already had.
   */
  includeMarkdownReport?: boolean;
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

/**
 * The only continuity signal available for a recomposition goal, where
 * `calculateCalorieRangeKcal` deliberately never hands the AI a
 * maintenance-calorie number to anchor a deficit against (see
 * profile/targets.ts — that goal is explicitly never reduced to a calorie
 * framing). Without this, every call reinvents an implied TDEE from
 * scratch, so a different AI reading the same kind of day can land on a
 * wildly different deficit even when the food logged is nearly identical.
 * This isn't shown as a target, just as "here's what's already been
 * established" — see the instruction that references it below.
 */
function buildRecentCalorieBalanceMarkdown(recentCalorieBalances: RecentCalorieBalance[]): string {
  if (recentCalorieBalances.length === 0) {
    return "No prior reports yet — nothing established to stay consistent with, use your own best judgment.";
  }
  return recentCalorieBalances
    .map((entry) => `${entry.date}: ${entry.calorieBalance}`)
    .join("\n");
}

/** Structured facts about who's asking — the AI interprets them, it never has to guess or ask what the user's goal is. */
function buildAboutMeMarkdown(userContext: UserContext): string {
  const { profile, proteinTargetG, calorieRangeKcal, carbsTargetG, fatTargetG, fiberTargetG, latestWeightKg } =
    userContext;
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

  const bmr = calculateBMR({
    dateOfBirth: profile.date_of_birth,
    biologicalSex: profile.biological_sex,
    heightCm: profile.height_cm,
    latestWeightKg,
  });
  const restingExpenditureKcal = calculateRestingExpenditureKcal(bmr);
  if (restingExpenditureKcal) {
    lines.push(
      `Estimated resting + ordinary-daily-living expenditure: ${restingExpenditureKcal} kcal/day (BMR scaled for a normal non-exercise day — digestion, incidental movement, posture — not just lying in bed doing nothing). Use it as described in the deficit/surplus instruction below, not on its own.`,
    );
  }

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

function buildStepsLine(stepsCaloriesBurned: BuildPromptInput["stepsCaloriesBurned"]): string {
  if (!stepsCaloriesBurned) return "Non-workout steps: Not logged";
  return `Non-workout steps: ${stepsCaloriesBurned.steps.toLocaleString()} steps ≈ ${stepsCaloriesBurned.caloriesBurned} kcal — already computed and added to workout_calories_burned automatically. Do NOT add your own "steps" entry to workout_exercises and do NOT add this figure into workout_calories_burned yourself; it's there for context only (e.g. worth a mention in coach_summary/strengths if it's a strong number).`;
}

export function buildNightlyReportPrompt({
  date,
  foodLogs,
  workoutLog,
  stepsCaloriesBurned,
  waterLog,
  sleepLog,
  weightLog,
  priorWeight,
  photoViewsCaptured,
  photoComparisonNote,
  userContext,
  weekSoFar,
  recentCalorieBalances,
  includeMarkdownReport = true,
}: BuildPromptInput): string {
  const foodByMeal = new Map<MealType, string>();
  for (const log of foodLogs) foodByMeal.set(log.meal_type, log.raw_text);

  const mealsMarkdown = MEAL_SECTIONS.map(
    (section) =>
      `${section.label}\n${foodByMeal.get(section.type) ?? "Not logged"}`,
  ).join("\n\n");

  const workoutMarkdown = workoutLog?.raw_text ?? "Not logged";
  const stepsLine = buildStepsLine(stepsCaloriesBurned);

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

${stepsLine}

## This Week So Far

${buildWeekSoFarMarkdown(weekSoFar)}

## Recent Calorie Balance (most recent reported days)

${buildRecentCalorieBalanceMarkdown(recentCalorieBalances)}

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
- A per-meal breakdown ("meal_breakdown"): for each of the 4 slots under
  "Today's Meals" above that has something logged (skip any marked "Not
  logged" entirely, don't invent an entry for it), give that meal's own
  calories/protein/carbs/fat. These are a split of the daily totals
  above, not a separate recomputation — they should add up to the
  Calories/Protein/Fat/Carbohydrates figures you just gave (rounding
  aside); if they don't, fix the split rather than leaving a mismatch.
- Micronutrients — check at least 3-4 that are actually relevant to
  today's log (protein/iron/calcium/vitamin-D-type staples are usually
  worth checking regardless of what else was eaten), each with a note
  naming the specific food(s) that covered it, or the specific gap if
  it didn't — "adequate" or "low" with no note is not useful on its own
- From the workout log: duration in minutes, total calories burned, and "workout_exercises" — one entry per distinct line/movement in the log above, IN FULL. This must be exhaustive, not a representative sample: count the distinct exercises/activities in the log yourself first, then confirm your "workout_exercises" array has exactly that many entries before moving on — a cardio interval, a walk, or any other non-strength line is exactly as mandatory an entry as a lifting exercise is, not something to fold into a summary sentence or quietly leave out. Each entry gets its own best-effort "calories_burned" estimate (only omit that one number, never the whole entry, if the log genuinely doesn't support a guess — omitting an entire exercise is a miss, omitting just its calorie number is fine). Non-workout steps are NOT part of this: they're tracked separately (see "Non-workout steps" under Today's Workout above) and the app adds their calorie contribution to workout_calories_burned itself, automatically — do not add a "steps" entry to workout_exercises and do not fold that figure into the total you state here, it would double it.
- Estimated calorie deficit/surplus, as both a sentence and a signed kcal number (negative = deficit). Compute this from real numbers, not a free guess or a flat carry-over: today's total energy expenditure ≈ the "Estimated resting + ordinary-daily-living expenditure" figure under "About Me" above, plus the workout_calories_burned total you just calculated above (that covers today's specific structured exercise; non-workout steps are added to it automatically after your response, don't add them yourself) — deficit/surplus is my estimated intake minus that sum. Use "Recent Calorie Balance" above as a plausibility check, not the primary method: if this calculation lands far outside that recent pattern, double check your arithmetic before assuming today was simply an outlier, but a day with genuinely unusual activity (like the workout total you just computed being well above or below normal) SHOULD move the deficit accordingly — don't flatten it back to the historical average just to stay consistent. There's no stored calorie target for a recomposition goal, so resting-plus-living expenditure plus measured activity is the only grounded basis available, and it needs to hold regardless of which AI reads this prompt — a provider or model change should never look like a change in my actual progress.

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
- A deliberate, explicitly-logged rest day (no structured training,
  described as rest/recovery) is NOT a zero-effort day — score
  workout_score high (typically 85-100), the same as scoring any other
  good training decision, since choosing to rest given the week's
  accumulated load is itself the right call, not the absence of one.
  Reserve a low workout_score for a day that should have had training
  and simply didn't, not for a day where rest was the actual plan.
  muscles_trained stays an empty list either way — resting doesn't train
  a muscle group, it just isn't a failure to.
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

${
  includeMarkdownReport
    ? `Return TWO outputs:

1. A beautiful markdown report.
2. A structured JSON object inside a \`\`\`json code block, matching exactly this shape (scores are integers 0-100, dates are YYYY-MM-DD):`
    : `Return ONLY a structured JSON object inside a \`\`\`json code block — no markdown report, no commentary before or after it, matching exactly this shape (scores are integers 0-100, dates are YYYY-MM-DD):`
}

\`\`\`json
${JSON.stringify(AI_REPORT_JSON_EXAMPLE, null, 2)}
\`\`\`

Only the JSON block will be imported back into the app — make sure it is valid, complete JSON with no trailing commas or comments.
`;
}
