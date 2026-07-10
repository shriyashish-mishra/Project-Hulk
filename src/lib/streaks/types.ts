export interface RecentWorkoutDay {
  date: string;
  trained: boolean;
}

export interface StreakSummary {
  loggingStreakDays: number;
  workoutStreakDays: number;
  nutritionStreakDays: number;
  recentWorkoutDays: RecentWorkoutDay[];
}
