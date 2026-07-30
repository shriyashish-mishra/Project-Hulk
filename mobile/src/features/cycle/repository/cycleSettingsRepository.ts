import type { SQLiteDatabase } from 'expo-sqlite';

/** Single-row settings table (`id = 1` by construction, seeded in the migration) — opt-in, off by default. */
export async function isCycleTrackingEnabled(db: SQLiteDatabase): Promise<boolean> {
  const row = await db.getFirstAsync<{ enabled: number }>('SELECT enabled FROM cycle_settings WHERE id = 1');
  return row?.enabled === 1;
}

export async function setCycleTrackingEnabled(db: SQLiteDatabase, enabled: boolean): Promise<void> {
  await db.runAsync('UPDATE cycle_settings SET enabled = ? WHERE id = 1', enabled ? 1 : 0);
}
