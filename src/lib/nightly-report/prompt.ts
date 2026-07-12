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
  userContext: UserContext;
}

/** Structured facts about who's asking — the AI interprets them, it never has to guess or ask what the user's goal is. */
function buildAboutMeMarkdown(userContext: UserContext): string {
  const { profile, proteinTargetG, calorieRangeKcal } = userContext;
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
  if (profile.target_weight_kg) lines.push(`Target weight: ${profile.target_weight_kg} kg`);

  return lines.length > 0 ? lines.join("\n") : "Not provided yet.";
}

function buildRecoveryContextMarkdown({
  waterLog,
  sleepLog,
  weightLog,
  priorWeight,
  photoViewsCaptured,
}: Pick<
  BuildPromptInput,
  "waterLog" | "sleepLog" | "weightLog" | "priorWeight" | "photoViewsCaptured"
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

  const photosLine =
    photoViewsCaptured.length > 0
      ? `Progress photos: captured today (${photoViewsCaptured.join(", ")}) — for my own tracking, not for you to view`
      : "Progress photos: Not captured today";

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
  userContext,
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
  });

  return `# Project Hulk

Date:
${date}

## Today's Meals

${mealsMarkdown}

## Today's Workout

${workoutMarkdown}

## Hydration, Sleep & Weight

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
- Micronutrients
- Estimated calorie deficit/surplus, as both a sentence and a signed kcal number (negative = deficit)
- From the workout log: duration in minutes, calories burned, and the individual exercises with sets/reps if mentioned (best-effort — leave an exercise out if the log genuinely doesn't support a guess)

Then analyse — weighed against my goal, targets, and training frequency
under "About Me" above, not generic advice:

- Nutrition quality
- Workout quality
- Recovery — a 0-100 assessment of how well-recovered I likely am, judged from training load, rest patterns, and today's hydration and sleep versus their targets above (not a biometric reading, a coaching judgment).
- Muscle groups trained
- What I did well (as many points as are genuinely worth noting)
- What I could improve (as many points as are genuinely worth noting)
- Suggested meals tomorrow
- Suggested workout tomorrow, both as a sentence and as a specific exercise list with sets/reps

IMPORTANT:

- Weight is logged for my own long-term tracking only, never as a daily
  performance signal. It must NOT influence nutrition_score,
  workout_score, recovery_score, or overall_score — base those four
  purely on today's food, training, hydration, and sleep.
- Judge workout_score only on the quality and effort of what I actually
  trained today (e.g. an arms-and-shoulders session should be scored as
  an arms-and-shoulders session, not marked down for skipping legs). No
  single day is expected to hit every muscle group — whether my training
  is balanced across muscle groups is a weekly/monthly question, never a
  daily one, so don't factor muscle-group coverage into today's score.

Return TWO outputs:

1. A beautiful markdown report.
2. A structured JSON object inside a \`\`\`json code block, matching exactly this shape (scores are integers 0-100, dates are YYYY-MM-DD):

\`\`\`json
${JSON.stringify(AI_REPORT_JSON_EXAMPLE, null, 2)}
\`\`\`

Only the JSON block will be imported back into the app — make sure it is valid, complete JSON with no trailing commas or comments.
`;
}
