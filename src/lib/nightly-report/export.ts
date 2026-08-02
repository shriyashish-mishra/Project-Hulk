import type { AiDailyReport, MicronutrientNote, TomorrowMeal, WorkoutExercise } from "./types";

const CSV_COLUMNS = [
  "Date",
  "Overall Score",
  "Nutrition Score",
  "Workout Score",
  "Recovery Score",
  "Recovery Note",
  "Calories (kcal)",
  "Protein (g)",
  "Carbs (g)",
  "Fat (g)",
  "Fiber (g)",
  "Micronutrients",
  "Calorie Balance",
  "Calorie Balance (kcal)",
  "Muscles Trained",
  "Workout Duration (min)",
  "Workout Calories Burned",
  "Workout Exercises",
  "Strengths",
  "Improvements",
  "Coach Summary",
  "Tomorrow's Workout",
  "Tomorrow's Workout Exercises",
  "Tomorrow's Meals",
  "Photo Comparison Note",
  "Raw Response",
  // The complete structured report as JSON — every column above is a
  // human-readable projection of this one. Kept last, even though it
  // duplicates the columns before it, so any consumer (like the mobile
  // app's CSV importer) can reconstruct the report losslessly without
  // reverse-parsing the semicolon-joined human-readable columns.
  "Full Data (JSON)",
] as const;

/** Wraps in quotes (doubling internal quotes) whenever a field contains a comma, quote, or newline — otherwise left bare, matching standard CSV conventions. */
function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatExercises(exercises: WorkoutExercise[] | undefined): string {
  if (!exercises || exercises.length === 0) return "";
  return exercises
    .map((exercise) => {
      const parts = [
        exercise.detail,
        exercise.calories_burned !== undefined ? `${exercise.calories_burned} kcal` : null,
      ].filter((part): part is string => Boolean(part));
      return parts.length > 0 ? `${exercise.name} (${parts.join(", ")})` : exercise.name;
    })
    .join("; ");
}

function formatMicronutrients(notes: MicronutrientNote[]): string {
  return notes.map((note) => `${note.name}: ${note.status}${note.note ? ` (${note.note})` : ""}`).join("; ");
}

function formatTomorrowMeals(meals: TomorrowMeal[]): string {
  return meals.map((meal) => `${meal.meal_type}: ${meal.suggestion}`).join("; ");
}

function reportToRow(report: AiDailyReport): string[] {
  const { parsed_json: parsed } = report;
  return [
    report.report_date,
    String(report.overall_score),
    String(report.nutrition_score),
    String(report.workout_score),
    parsed.recovery_score !== undefined ? String(parsed.recovery_score) : "",
    parsed.recovery_note ?? "",
    String(parsed.estimated_calories),
    String(parsed.protein_g),
    String(parsed.carbs_g),
    String(parsed.fat_g),
    String(parsed.fiber_g),
    formatMicronutrients(parsed.micronutrients),
    parsed.calorie_balance,
    parsed.calorie_balance_kcal !== undefined ? String(parsed.calorie_balance_kcal) : "",
    parsed.muscles_trained.join("; "),
    parsed.workout_duration_min !== undefined ? String(parsed.workout_duration_min) : "",
    parsed.workout_calories_burned !== undefined ? String(parsed.workout_calories_burned) : "",
    formatExercises(parsed.workout_exercises),
    parsed.strengths.join("; "),
    parsed.improvements.join("; "),
    report.coach_summary,
    parsed.tomorrow_workout,
    formatExercises(parsed.tomorrow_workout_exercises),
    formatTomorrowMeals(parsed.tomorrow_meals),
    parsed.photo_comparison_note ?? "",
    report.raw_response,
    JSON.stringify(parsed),
  ];
}

/** One row per day in the range, oldest first — reports is already ordered ascending by getReportsInRange. */
export function buildReportsCsv(reports: AiDailyReport[]): string {
  const lines = [CSV_COLUMNS.join(",")];
  for (const report of reports) {
    lines.push(reportToRow(report).map(escapeCsvField).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}
