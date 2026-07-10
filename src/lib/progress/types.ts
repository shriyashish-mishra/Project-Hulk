export interface DailyTrendPoint {
  date: string;
  nutritionScore: number;
  workoutScore: number;
  overallScore: number;
  proteinG: number;
  estimatedCalories: number;
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
}

export interface MuscleGroupCount {
  muscle: string;
  count: number;
}

export interface CoachInsight {
  text: string;
}
