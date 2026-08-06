import { CURRENT_SCHEMA_VERSION } from "./constants";
import type {
  AiReportJson,
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

/** Extracts, validates, and normalizes the JSON block from Claude's pasted response. */
export function parseAiReportResponse(rawResponse: string): AiReportJson {
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

  return {
    schema_version,
    date: expectString(obj, "date"),
    estimated_calories: expectNumber(obj, "estimated_calories"),
    protein_g: expectNumber(obj, "protein_g"),
    carbs_g: expectNumber(obj, "carbs_g"),
    fat_g: expectNumber(obj, "fat_g"),
    fiber_g: expectNumber(obj, "fiber_g"),
    micronutrients: expectMicronutrients(obj, "micronutrients"),
    calorie_balance: expectString(obj, "calorie_balance"),
    calorie_balance_kcal: optionalNumber(obj, "calorie_balance_kcal"),
    nutrition_score: expectScore(obj, "nutrition_score"),
    workout_score: expectScore(obj, "workout_score"),
    overall_score: expectScore(obj, "overall_score"),
    recovery_score: optionalScore(obj, "recovery_score"),
    recovery_note: optionalString(obj, "recovery_note"),
    muscles_trained: expectStringArray(obj, "muscles_trained"),
    workout_duration_min: optionalNumber(obj, "workout_duration_min"),
    workout_calories_burned: optionalNumber(obj, "workout_calories_burned"),
    workout_exercises: optionalExercises(obj, "workout_exercises"),
    strengths: expectStringArray(obj, "strengths"),
    improvements: expectStringArray(obj, "improvements"),
    tomorrow_meals: expectTomorrowMeals(obj, "tomorrow_meals"),
    tomorrow_workout: expectString(obj, "tomorrow_workout"),
    tomorrow_workout_exercises: optionalExercises(obj, "tomorrow_workout_exercises"),
    coach_summary: expectString(obj, "coach_summary"),
  };
}
