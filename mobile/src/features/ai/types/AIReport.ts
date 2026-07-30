export interface AIReportScores {
  nutrition: number;
  activity: number;
  recovery: number;
}

/** What the parser extracts from Claude's raw text — everything except the identifiers/versions the service attaches when it saves the record. */
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
}

/** A saved report — `AIReportContent` plus the identifiers needed to look it up and know which context/prompt shape produced it. */
export interface AIReport extends AIReportContent {
  id: number;
  date: string;
  contextVersion: string;
  promptVersion: string;
  createdAt: string;
}
