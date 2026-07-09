import { CURRENT_SCHEMA_VERSION } from "./constants";
import type { AiReportJson, MicronutrientNote, TomorrowMeal } from "./types";

const MEAL_TYPES = new Set(["breakfast", "lunch", "snacks", "dinner"]);
const MICRONUTRIENT_STATUSES = new Set(["low", "adequate", "high"]);

class ReportParseError extends Error {}

function extractJsonBlock(rawResponse: string): string {
  const fenced = rawResponse.match(/```json\s*([\s\S]*?)```/i);
  if (fenced) return fenced[1].trim();

  const start = rawResponse.indexOf("{");
  const end = rawResponse.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new ReportParseError(
      "Couldn't find a JSON block in the pasted response. Make sure you copied the full reply, including the ```json code block.",
    );
  }
  return rawResponse.slice(start, end + 1);
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
    nutrition_score: expectScore(obj, "nutrition_score"),
    workout_score: expectScore(obj, "workout_score"),
    overall_score: expectScore(obj, "overall_score"),
    muscles_trained: expectStringArray(obj, "muscles_trained"),
    strengths: expectStringArray(obj, "strengths"),
    improvements: expectStringArray(obj, "improvements"),
    tomorrow_meals: expectTomorrowMeals(obj, "tomorrow_meals"),
    tomorrow_workout: expectString(obj, "tomorrow_workout"),
    coach_summary: expectString(obj, "coach_summary"),
  };
}
