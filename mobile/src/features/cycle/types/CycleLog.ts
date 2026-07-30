/** A single logged period — start date, and an end date once it's over. No phase math or predictions live on this type; that's explicitly future AI-insights work, not this foundation. */
export interface CycleLog {
  id: number;
  startDate: string;
  endDate: string | null;
  createdAt: string;
}
