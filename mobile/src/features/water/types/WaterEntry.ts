/** One "I drank water" event — the day's total is always derived by summing these, never stored as its own mutable counter. */
export interface WaterEntry {
  id: number;
  entryDate: string;
  amountMl: number;
  createdAt: string;
}
