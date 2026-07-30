/**
 * A single freeform journal entry. Deliberately not constrained to one
 * per day — no unique(entry_date) at the database level — since
 * morning/evening entries, multiple entries, and templates are future
 * features this shouldn't block. "Today's entry" is a business-logic
 * concept owned by `JournalService`, not a schema constraint.
 *
 * `body` is a plain string today, but nothing here assumes plain text
 * forever — a future markdown/checklist/rich-block format can still be
 * serialized into this same field without a schema change.
 */
export interface JournalEntry {
  id: number;
  entryDate: string;
  body: string;
  createdAt: string;
  updatedAt: string;
}
