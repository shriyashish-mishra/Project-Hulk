/**
 * The unsaved-changes buffer for a day's entry — written far more
 * aggressively than `JournalEntry` so a crash or force-quit never loses
 * more than a few hundred milliseconds of typing. `entryId` is `null`
 * until the entry it belongs to has been created for the first time.
 */
export interface JournalDraft {
  id: number;
  entryDate: string;
  entryId: number | null;
  body: string;
  updatedAt: string;
}
