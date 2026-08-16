import { CURRENT_SCHEMA_VERSION } from "./constants";
import { calculateRestingExpenditureKcal } from "@/lib/profile/targets";
import type {
  AiReportJson,
  MealBreakdown,
  MicronutrientNote,
  TomorrowMeal,
  WorkoutExercise,
} from "./types";

const MEAL_TYPES = new Set(["breakfast", "lunch", "snacks", "dinner"]);
const MICRONUTRIENT_STATUSES = new Set(["low", "adequate", "high"]);

class ReportParseError extends Error {}

/**
 * Handles both a ```json fence and a bare ``` fence (Claude doesn't always
 * label the language), and falls back to scanning the raw text directly
 * when there's no fence at all. Once a candidate is picked, walks forward
 * from its first "{" tracking string-literal state so braces inside a
 * string value (e.g. a coach_summary sentence) don't throw off the depth
 * count, and stops exactly where the outermost object closes — unlike a
 * naive lastIndexOf("}"), this doesn't break if Claude adds any trailing
 * commentary after the JSON that happens to contain a stray "}".
 */
function extractJsonBlock(rawResponse: string): string {
  const fenced = rawResponse.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : rawResponse;

  const start = candidate.indexOf("{");
  if (start === -1) {
    throw new ReportParseError(
      "Couldn't find a JSON block in the pasted response. Make sure you copied the full reply, including the ```json code block.",
    );
  }

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < candidate.length; i++) {
    const char = candidate[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth++;
    else if (char === "}") {
      depth--;
      if (depth === 0) return candidate.slice(start, i + 1);
    }
  }

  throw new ReportParseError(
    "Couldn't find a complete JSON block in the pasted response. Make sure you copied the full reply.",
  );
}

function field(obj: Record<string, unknown>, key: string): unknown {
  return obj[key];
}

function expectNumber(obj: Record<string, unknown>, key: string): number {
  const value = field(obj, key);
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new ReportParseError(`"${key}" must be a number.`);
  }
  return value;
}

function expectString(obj: Record<string, unknown>, key: string): string {
  const value = field(obj, key);
  if (typeof value !== "string" || !value.trim()) {
    throw new ReportParseError(`"${key}" must be a non-empty string.`);
  }
  return value;
}

function expectStringArray(obj: Record<string, unknown>, key: string): string[] {
  const value = field(obj, key);
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
    throw new ReportParseError(`"${key}" must be an array of strings.`);
  }
  return value;
}

function expectScore(obj: Record<string, unknown>, key: string): number {
  const value = expectNumber(obj, key);
  if (value < 0 || value > 100) {
    throw new ReportParseError(`"${key}" must be between 0 and 100.`);
  }
  return Math.round(value);
}

/** Non-throwing — new-in-schema-v2 fields degrade gracefully instead of failing the whole import. */
function optionalNumber(obj: Record<string, unknown>, key: string): number | undefined {
  const value = field(obj, key);
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function optionalScore(obj: Record<string, unknown>, key: string): number | undefined {
  const value = optionalNumber(obj, key);
  return value === undefined ? undefined : Math.round(Math.min(100, Math.max(0, value)));
}

function optionalString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = field(obj, key);
  return typeof value === "string" && value.trim() ? value : undefined;
}

function optionalExercises(
  obj: Record<string, unknown>,
  key: string,
): WorkoutExercise[] | undefined {
  const value = field(obj, key);
  if (!Array.isArray(value)) return undefined;
  const exercises = value
    .map((item): WorkoutExercise | null => {
      if (typeof item === "string" && item.trim()) return { name: item.trim() };
      if (typeof item === "object" && item !== null) {
        const record = item as Record<string, unknown>;
        const name = field(record, "name");
        if (typeof name !== "string" || !name.trim()) return null;
        const detail = field(record, "detail");
        const caloriesBurned = optionalNumber(record, "calories_burned");
        return {
          name: name.trim(),
          ...(typeof detail === "string" && detail.trim() ? { detail: detail.trim() } : {}),
          ...(caloriesBurned !== undefined ? { calories_burned: caloriesBurned } : {}),
        };
      }
      return null;
    })
    .filter((item): item is WorkoutExercise => item !== null);
  return exercises.length > 0 ? exercises : undefined;
}

/** Non-throwing, like optionalExercises — a meal breakdown is an enhancement, not core data an older/imperfect response should fail over. */
function optionalMealBreakdown(
  obj: Record<string, unknown>,
  key: string,
): MealBreakdown[] | undefined {
  const value = field(obj, key);
  if (!Array.isArray(value)) return undefined;
  const meals = value
    .map((item): MealBreakdown | null => {
      if (typeof item !== "object" || item === null) return null;
      const record = item as Record<string, unknown>;
      const mealType = field(record, "meal_type");
      if (typeof mealType !== "string" || !MEAL_TYPES.has(mealType)) return null;
      const estimatedCalories = optionalNumber(record, "estimated_calories");
      const proteinG = optionalNumber(record, "protein_g");
      const carbsG = optionalNumber(record, "carbs_g");
      const fatG = optionalNumber(record, "fat_g");
      if (
        estimatedCalories === undefined ||
        proteinG === undefined ||
        carbsG === undefined ||
        fatG === undefined
      ) {
        return null;
      }
      return {
        meal_type: mealType as MealBreakdown["meal_type"],
        estimated_calories: estimatedCalories,
        protein_g: proteinG,
        carbs_g: carbsG,
        fat_g: fatG,
      };
    })
    .filter((item): item is MealBreakdown => item !== null);
  return meals.length > 0 ? meals : undefined;
}

function expectMicronutrients(
  obj: Record<string, unknown>,
  key: string,
): MicronutrientNote[] {
  const value = field(obj, key);
  if (!Array.isArray(value)) {
    throw new ReportParseError(`"${key}" must be an array.`);
  }
  return value.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new ReportParseError(`"${key}[${index}]" must be an object.`);
    }
    const record = item as Record<string, unknown>;
    const name = expectString(record, "name");
    const status = field(record, "status");
    if (typeof status !== "string" || !MICRONUTRIENT_STATUSES.has(status)) {
      throw new ReportParseError(
        `"${key}[${index}].status" must be one of low, adequate, high.`,
      );
    }
    const note = field(record, "note");
    return {
      name,
      status: status as MicronutrientNote["status"],
      ...(typeof note === "string" && note.trim() ? { note } : {}),
    };
  });
}

function expectTomorrowMeals(
  obj: Record<string, unknown>,
  key: string,
): TomorrowMeal[] {
  const value = field(obj, key);
  if (!Array.isArray(value)) {
    throw new ReportParseError(`"${key}" must be an array.`);
  }
  return value.map((item, index) => {
    if (typeof item !== "object" || item === null) {
      throw new ReportParseError(`"${key}[${index}]" must be an object.`);
    }
    const record = item as Record<string, unknown>;
    const mealType = field(record, "meal_type");
    if (typeof mealType !== "string" || !MEAL_TYPES.has(mealType)) {
      throw new ReportParseError(
        `"${key}[${index}].meal_type" must be one of breakfast, lunch, snacks, dinner.`,
      );
    }
    return {
      meal_type: mealType as TomorrowMeal["meal_type"],
      suggestion: expectString(record, "suggestion"),
    };
  });
}

function formatCalorieBalance(kcal: number): string {
  const rounded = Math.round(kcal);
  return `${rounded >= 0 ? "+" : ""}${rounded} kcal (${rounded < 0 ? "deficit" : "surplus"})`;
}

/**
 * Deterministic non-workout-steps calorie figure, computed by the caller
 * (from structured `workout_logs.non_workout_steps` input, never AI-parsed
 * text — see `calculateStepsCaloriesBurned`) and threaded through here so
 * it can be folded into `workout_calories_burned` the same authoritative
 * way regardless of what the AI's own response does or doesn't say about
 * steps. `steps` is kept alongside `caloriesBurned` only for display
 * (the synthesized workout_exercises entry's detail text).
 */
export interface StepsInput {
  steps: number;
  caloriesBurned: number;
}

/**
 * Extracts, validates, and normalizes the JSON block from a Claude/Gemini
 * response. `bmr` — when known — lets this override the AI's own stated
 * calorie_balance_kcal with a deterministic
 * `estimated_calories - restingExpenditureKcal - workout_calories_burned`,
 * for the same reason workout_calories_burned itself is overridden below:
 * asking an LLM to combine several independently-produced numbers into a
 * new one is exactly the kind of arithmetic this codebase already doesn't
 * trust it with. Observed in practice: a response whose own stated BMR and
 * workout total, added together, didn't match its own stated deficit by
 * 200 kcal. Uses `calculateRestingExpenditureKcal(bmr)` rather than raw
 * `bmr` — raw BMR is resting-only (calories burned lying in bed all day),
 * so subtracting it alone and adding back nothing but that day's logged
 * exercise silently assumed zero expenditure for ordinary daily living
 * (TEF, incidental movement, posture) on top, which understated every
 * deficit by a couple hundred kcal. See that function's doc for why the
 * flat sedentary multiplier is used instead of the user's own
 * activity_level. Skipped when bmr is unavailable (e.g. profile
 * incomplete) — falls back to the AI's own figure rather than guessing.
 *
 * `stepsInput` — when known — is the deterministic replacement for
 * whatever the AI itself did with non-workout steps. Reports "for many
 * days steps just weren't considered" even after the log explicitly
 * mentioned them (a smaller/faster model reading the instruction
 * literally and skipping anything without sets/reps) — structured input
 * removes the model from this number's existence altogether: any
 * AI-itemized "steps"-named entry is stripped and replaced with our own,
 * so the figure can never again depend on the model noticing it.
 */
export function parseAiReportResponse(
  rawResponse: string,
  bmr?: number | null,
  stepsInput?: StepsInput | null,
): AiReportJson {
  const jsonText = extractJsonBlock(rawResponse);

  let data: unknown;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new ReportParseError(
      "The JSON block isn't valid JSON. Check for trailing commas or truncated text.",
    );
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    throw new ReportParseError("The JSON block must be an object.");
  }
  const obj = data as Record<string, unknown>;

  const schemaVersionRaw = field(obj, "schema_version");
  const schema_version =
    typeof schemaVersionRaw === "number" ? schemaVersionRaw : CURRENT_SCHEMA_VERSION;

  const aiWorkoutExercises = optionalExercises(obj, "workout_exercises");
  const aiWorkoutCaloriesBurned = optionalNumber(obj, "workout_calories_burned");

  // A deterministic steps figure supersedes anything the AI itself did
  // with non-workout steps — strip any entry it itemized under that name
  // (old prompt versions, or a response pasted from outside the app) so
  // it's never double-counted alongside our own authoritative entry
  // below. Left untouched when stepsInput is unavailable (e.g. this day
  // predates the feature) — the AI's own free-text inference is still
  // better than nothing in that case.
  const stepsExercise: WorkoutExercise | null =
    stepsInput && stepsInput.caloriesBurned > 0
      ? {
          name: "Daily Steps (non-workout)",
          detail: `${stepsInput.steps.toLocaleString()} steps`,
          calories_burned: stepsInput.caloriesBurned,
        }
      : null;
  const dedupedWorkoutExercises = stepsExercise
    ? aiWorkoutExercises?.filter((exercise) => !/\bsteps?\b/i.test(exercise.name))
    : aiWorkoutExercises;
  const workout_exercises: WorkoutExercise[] | undefined = stepsExercise
    ? [...(dedupedWorkoutExercises ?? []), stepsExercise]
    : dedupedWorkoutExercises;

  // The AI's own top-line total is not trustworthy arithmetic — asking any
  // model to sum many independently-estimated numbers is exactly the kind
  // of task this codebase already doesn't leave to an LLM (see
  // profile/targets.ts). Observed in practice: a per-exercise breakdown
  // that individually checked out (including a step-count entry verified
  // against a real formula) next to a stated total that was off by 250+
  // kcal, not a rounding difference. Whenever the exercise list has at
  // least one usable estimate, the sum of those is what gets stored —
  // never the AI's separately-stated figure — so the total shown is
  // always exactly what adding up the visible breakdown would give,
  // by construction, regardless of which model generated it. Since
  // `workout_exercises` here already includes the deterministic steps
  // entry when there is one, this sum can never omit it the way a
  // purely AI-driven total could.
  const exerciseCaloriesSum = workout_exercises
    ?.map((exercise) => exercise.calories_burned)
    .filter((value): value is number => value !== undefined)
    .reduce((sum, value) => sum + value, 0);
  const workout_calories_burned =
    exerciseCaloriesSum !== undefined && exerciseCaloriesSum > 0
      ? exerciseCaloriesSum
      : aiWorkoutCaloriesBurned;

  const estimated_calories = expectNumber(obj, "estimated_calories");
  const aiCalorieBalance = expectString(obj, "calorie_balance");
  const aiCalorieBalanceKcal = optionalNumber(obj, "calorie_balance_kcal");
  const restingExpenditureKcal = calculateRestingExpenditureKcal(bmr ?? null);
  const deterministicBalanceKcal =
    restingExpenditureKcal != null
      ? estimated_calories - restingExpenditureKcal - (workout_calories_burned ?? 0)
      : null;
  const calorie_balance_kcal = deterministicBalanceKcal ?? aiCalorieBalanceKcal;
  const calorie_balance =
    deterministicBalanceKcal !== null ? formatCalorieBalance(deterministicBalanceKcal) : aiCalorieBalance;

  return {
    schema_version,
    date: expectString(obj, "date"),
    estimated_calories,
    protein_g: expectNumber(obj, "protein_g"),
    carbs_g: expectNumber(obj, "carbs_g"),
    fat_g: expectNumber(obj, "fat_g"),
    fiber_g: expectNumber(obj, "fiber_g"),
    micronutrients: expectMicronutrients(obj, "micronutrients"),
    calorie_balance,
    calorie_balance_kcal,
    nutrition_score: expectScore(obj, "nutrition_score"),
    workout_score: expectScore(obj, "workout_score"),
    overall_score: expectScore(obj, "overall_score"),
    recovery_score: optionalScore(obj, "recovery_score"),
    recovery_note: optionalString(obj, "recovery_note"),
    muscles_trained: expectStringArray(obj, "muscles_trained"),
    workout_duration_min: optionalNumber(obj, "workout_duration_min"),
    workout_calories_burned,
    workout_exercises,
    strengths: expectStringArray(obj, "strengths"),
    improvements: expectStringArray(obj, "improvements"),
    tomorrow_meals: expectTomorrowMeals(obj, "tomorrow_meals"),
    tomorrow_workout: expectString(obj, "tomorrow_workout"),
    tomorrow_workout_exercises: optionalExercises(obj, "tomorrow_workout_exercises"),
    coach_summary: expectString(obj, "coach_summary"),
    meal_breakdown: optionalMealBreakdown(obj, "meal_breakdown"),
  };
}
