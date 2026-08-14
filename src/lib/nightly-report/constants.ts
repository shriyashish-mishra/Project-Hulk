export const CURRENT_SCHEMA_VERSION = 3;

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
    { name: "Vitamin C", status: "adequate", note: "citrus at breakfast and the salad at lunch both contributed" },
    { name: "Iron", status: "low", note: "no red meat or leafy greens logged today — consider adding one" },
    { name: "Calcium", status: "adequate", note: "yogurt and the whey shake covered most of it" },
    { name: "Vitamin D", status: "low", note: "no clear dietary source logged — a consistent gap worth a supplement or more sun" },
  ],
  calorie_balance: "-320 kcal (deficit)",
  calorie_balance_kcal: -320,
  nutrition_score: 78,
  workout_score: 85,
  overall_score: 80,
  recovery_score: 62,
  recovery_note:
    "This is the third session in four days with only one rest day taken — accumulated fatigue from that pattern outweighs today's own decent sleep and hydration, so recovery is trending down even though nothing about today in isolation looks off.",
  muscles_trained: ["chest", "shoulders", "triceps"],
  workout_duration_min: 55,
  workout_calories_burned: 420,
  workout_exercises: [
    { name: "Incline Dumbbell Press", detail: "4x10", calories_burned: 60 },
    { name: "Lateral Raises", detail: "4x12", calories_burned: 30 },
    { name: "Overhead Tricep Extension", detail: "3x12", calories_burned: 25 },
  ],
  strengths: [
    "Protein cleared target from whole-food sources — eggs at breakfast, chicken at lunch, dal at dinner",
    "Full push session with progressive loading across all four exercises",
    "Sleep and hydration both landed right at target",
    "Consistent meal timing across all four slots, nothing skipped",
  ],
  improvements: [
    "Fiber came in well under the 28g target — today's meals were light on vegetables and whole grains",
    "Vitamin D has no dietary source again — a recurring gap worth addressing directly",
    "Third training day this week with only one rest day taken — worth planning true rest soon",
  ],
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
  coach_summary:
    "Strong push session backed by protein right at target from whole-food sources. Fiber and vitamin D are the recurring gaps to close. This is the third training day this week with only one rest day taken, so recovery is worth watching even though today's own sleep and hydration were both on point.",
} as const;
