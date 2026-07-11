export const CURRENT_SCHEMA_VERSION = 2;

/**
 * Shown inside the generated prompt so Claude returns JSON in exactly
 * the shape `parseAiReportResponse` expects — field names, types, and
 * the 0-100 score scale all need to match `AiReportJson`.
 */
export const AI_REPORT_JSON_EXAMPLE = {
  schema_version: CURRENT_SCHEMA_VERSION,
  date: "2026-07-10",
  estimated_calories: 2100,
  protein_g: 150,
  carbs_g: 220,
  fat_g: 70,
  fiber_g: 28,
  micronutrients: [
    { name: "Vitamin C", status: "adequate" },
    { name: "Iron", status: "low", note: "consider leafy greens or red meat" },
  ],
  calorie_balance: "-320 kcal (deficit)",
  calorie_balance_kcal: -320,
  nutrition_score: 78,
  workout_score: 85,
  overall_score: 80,
  recovery_score: 82,
  recovery_note: "Training load was moderate and well spaced — recovery looks on track.",
  muscles_trained: ["chest", "shoulders", "triceps"],
  workout_duration_min: 55,
  workout_calories_burned: 420,
  workout_exercises: [
    { name: "Incline Dumbbell Press", detail: "4x10" },
    { name: "Lateral Raises", detail: "4x12" },
    { name: "Overhead Tricep Extension", detail: "3x12" },
  ],
  strengths: ["High protein intake", "Consistent meal timing"],
  improvements: ["Low fiber", "Add more vegetables at dinner"],
  tomorrow_meals: [
    { meal_type: "breakfast", suggestion: "Greek yogurt with berries and oats" },
    { meal_type: "lunch", suggestion: "Grilled fish with quinoa and greens" },
    { meal_type: "snacks", suggestion: "A handful of almonds and a fruit" },
    { meal_type: "dinner", suggestion: "Lean protein with a fiber-rich side" },
  ],
  tomorrow_workout: "Leg day: squats, lunges, leg press, calf raises",
  tomorrow_workout_exercises: [
    { name: "Back Squats", detail: "4x8" },
    { name: "Walking Lunges", detail: "3x12 each leg" },
    { name: "Leg Press", detail: "3x12" },
    { name: "Calf Raises", detail: "3x15" },
  ],
  coach_summary: "Solid day overall — great protein intake, just watch fiber.",
} as const;
