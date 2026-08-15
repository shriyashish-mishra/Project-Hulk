export interface DailyTrendPoint {
  date: string;
  nutritionScore: number;
  workoutScore: number;
  overallScore: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  estimatedCalories: number;
  calorieBalanceKcal: number | null;
  /** The AI's single holistic estimate for the day — structured exercises plus anything else mentioned in the log (e.g. non-workout steps), not just a sum of workout_exercises. Absent on reports from before schema v2, or a rest day with nothing to estimate. */
  workoutCaloriesBurned: number | null;
  musclesTrained: string[];
  coachSummary: string;
}

export interface PeriodSummary {
  daysWithReports: number;
  avgProteinG: number | null;
  avgCalories: number | null;
  avgNutritionScore: number | null;
  avgWorkoutScore: number | null;
  avgOverallScore: number | null;
  workoutsCompleted: number;
  restDays: number;
  /** Sum of workoutCaloriesBurned across days that have a value — days with none (rest days, or pre-schema-v2 reports) are excluded rather than treated as zero. */
  totalWorkoutCaloriesBurned: number;
}

export interface MuscleGroupCount {
  muscle: string;
  count: number;
}

export interface CoachInsight {
  text: string;
}
