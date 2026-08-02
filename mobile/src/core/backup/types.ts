/** Every column value in this schema is TEXT/INTEGER/REAL/NULL — no BLOBs — so a plain JS primitive round-trips through JSON without loss. */
export type BackupRow = Record<string, string | number | null>;

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  tables: Record<string, BackupRow[]>;
}
