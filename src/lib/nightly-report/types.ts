import type { Database } from "@/lib/supabase/database.types";
import type { MealType } from "@/lib/food-logs/types";

export type AiDailyReportRow =
  Database["public"]["Tables"]["daily_ai_reports"]["Row"];

/** A `daily_ai_reports` row with `parsed_json` narrowed to `AiReportJson`. */
export type AiDailyReport = Omit<AiDailyReportRow, "parsed_json"> & {
  parsed_json: AiReportJson;
};

/**
 * The contract between Claude and Project Hulk. Bump
 * `CURRENT_SCHEMA_VERSION` (nightly-report/constants.ts) on breaking
 * changes so older stored reports remain identifiable.
 */
export interface AiReportJson {
  schema_version: number;
  date: string;
  estimated_calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  micronutrients: MicronutrientNote[];
  calorie_balance: string;
  /** Signed kcal vs. maintenance — negative is a deficit, positive a surplus. Optional: absent on reports imported before schema v2. */
  calorie_balance_kcal?: number;
  nutrition_score: number;
  workout_score: number;
  overall_score: number;
  /** AI's qualitative recovery assessment (0-100) from training load + rest described in the logs — not a biometric reading. Optional: absent on reports imported before schema v2. */
  recovery_score?: number;
  recovery_note?: string;
  muscles_trained: string[];
  /** AI-estimated from the free-text workout log. Optional: absent on reports imported before schema v2. */
  workout_duration_min?: number;
  workout_calories_burned?: number;
  workout_exercises?: WorkoutExercise[];
  strengths: string[];
  improvements: string[];
  tomorrow_meals: TomorrowMeal[];
  tomorrow_workout: string;
  tomorrow_workout_exercises?: WorkoutExercise[];
  coach_summary: string;
  /** Vision comparison of today's progress photo(s) against the most recent prior capture of each view — computed by us, not by the AI that returns the rest of this JSON. Optional: absent when no photo was captured today or no baseline exists yet. */
  photo_comparison_note?: string;
}

export interface MicronutrientNote {
  name: string;
  status: "low" | "adequate" | "high";
  note?: string;
}

export interface TomorrowMeal {
  meal_type: MealType;
  suggestion: string;
}

export interface WorkoutExercise {
  name: string;
  detail?: string;
  /** Best-effort per-exercise estimate — the workout-wide `workout_calories_burned` total isn't a per-movement breakdown, so this is separate. Optional: absent on reports imported before schema v3. */
  calories_burned?: number;
}
