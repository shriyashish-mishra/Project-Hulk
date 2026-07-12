import type { AiDailyReport } from "./types";

const CSV_COLUMNS = [
  "Date",
  "Overall Score",
  "Nutrition Score",
  "Workout Score",
  "Recovery Score",
  "Calories (kcal)",
  "Protein (g)",
  "Carbs (g)",
  "Fat (g)",
  "Fiber (g)",
  "Calorie Balance",
  "Muscles Trained",
  "Strengths",
  "Improvements",
  "Coach Summary",
  "Tomorrow's Workout",
] as const;

/** Wraps in quotes (doubling internal quotes) whenever a field contains a comma, quote, or newline — otherwise left bare, matching standard CSV conventions. */
function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function reportToRow(report: AiDailyReport): string[] {
  const { parsed_json: parsed } = report;
  return [
    report.report_date,
    String(report.overall_score),
    String(report.nutrition_score),
    String(report.workout_score),
    parsed.recovery_score !== undefined ? String(parsed.recovery_score) : "",
    String(parsed.estimated_calories),
    String(parsed.protein_g),
    String(parsed.carbs_g),
    String(parsed.fat_g),
    String(parsed.fiber_g),
    parsed.calorie_balance,
    parsed.muscles_trained.join("; "),
    parsed.strengths.join("; "),
    parsed.improvements.join("; "),
    report.coach_summary,
    parsed.tomorrow_workout,
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
