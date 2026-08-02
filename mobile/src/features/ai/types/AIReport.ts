export interface AIReportScores {
  nutrition: number;
  activity: number;
  recovery: number;
}

export interface AIReportExercise {
  name: string;
  detail?: string;
  caloriesBurned?: number;
}

/** What the parser extracts from Claude's raw text — everything except the identifiers/versions the service attaches when it saves the record. Fields below `tomorrowSuggestions` are schema-v2-only — absent (not zero, not empty) on reports parsed by `dailyReportParser.v1`. */
export interface AIReportContent {
  summary: string;
  scores: AIReportScores;
  wins: string[];
  improvements: string[];
  nutritionFeedback: string;
  workoutFeedback: string;
  recoveryFeedback: string;
  tomorrowSuggestions: string[];
  /** Always kept, even when parsing is imperfect — nothing the user pasted in is ever discarded. */
  rawResponse: string;
  estimatedCalories?: number;
  proteinG?: number;
  carbsG?: number;
  fatG?: number;
  fiberG?: number;
  calorieBalanceText?: string;
  /** Signed kcal vs. maintenance — negative is a deficit, positive a surplus. */
  calorieBalanceKcal?: number;
  musclesTrained?: string[];
  workoutDurationMin?: number;
  workoutCaloriesBurned?: number;
  workoutExercises?: AIReportExercise[];
}

/** A saved report — `AIReportContent` plus the identifiers needed to look it up and know which context/prompt shape produced it. */
export interface AIReport extends AIReportContent {
  id: number;
  date: string;
  contextVersion: string;
  promptVersion: string;
  createdAt: string;
}
