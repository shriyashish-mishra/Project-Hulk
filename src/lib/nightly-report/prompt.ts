import { MEAL_SECTIONS } from "@/lib/food-logs/constants";
import type { FoodLog, MealType } from "@/lib/food-logs/types";
import type { WorkoutLog } from "@/lib/workout-logs/types";
import { AI_REPORT_JSON_EXAMPLE, USER_GOAL_TEXT } from "./constants";

interface BuildPromptInput {
  date: string;
  foodLogs: FoodLog[];
  workoutLog: WorkoutLog | null;
}

export function buildNightlyReportPrompt({
  date,
  foodLogs,
  workoutLog,
}: BuildPromptInput): string {
  const foodByMeal = new Map<MealType, string>();
  for (const log of foodLogs) foodByMeal.set(log.meal_type, log.raw_text);

  const mealsMarkdown = MEAL_SECTIONS.map(
    (section) =>
      `${section.label}\n${foodByMeal.get(section.type) ?? "Not logged"}`,
  ).join("\n\n");

  const workoutMarkdown = workoutLog?.raw_text ?? "Not logged";

  return `# Project Hulk

Date:
${date}

## Today's Meals

${mealsMarkdown}

## Today's Workout

${workoutMarkdown}

## My Goal

${USER_GOAL_TEXT}

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

Then analyse:

- Nutrition quality
- Workout quality
- Recovery — a 0-100 assessment of how well-recovered I likely am, judged from training load, rest patterns, and anything I mentioned (not a biometric reading, a coaching judgment)
- Muscle groups trained
- What I did well (as many points as are genuinely worth noting)
- What I could improve (as many points as are genuinely worth noting)
- Suggested meals tomorrow
- Suggested workout tomorrow, both as a sentence and as a specific exercise list with sets/reps

Return TWO outputs:

1. A beautiful markdown report.
2. A structured JSON object inside a \`\`\`json code block, matching exactly this shape (scores are integers 0-100, dates are YYYY-MM-DD):

\`\`\`json
${JSON.stringify(AI_REPORT_JSON_EXAMPLE, null, 2)}
\`\`\`

Only the JSON block will be imported back into the app — make sure it is valid, complete JSON with no trailing commas or comments.
`;
}
