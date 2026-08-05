import type { SQLiteDatabase } from 'expo-sqlite';

import type { Preset } from '../types';

interface PresetRow {
  id: number;
  raw_text: string;
  created_at: string;
}

function mapRow(row: PresetRow): Preset {
  return { id: row.id, rawText: row.raw_text, createdAt: row.created_at };
}

type PresetTable = 'food_presets' | 'workout_presets';

/** `food_presets` and `workout_presets` share an identical schema — one small parameterized implementation instead of two near-duplicate files. */
async function listPresets(db: SQLiteDatabase, table: PresetTable): Promise<Preset[]> {
  const rows = await db.getAllAsync<PresetRow>(`SELECT * FROM ${table} ORDER BY created_at ASC`);
  return rows.map(mapRow);
}

async function createPreset(db: SQLiteDatabase, table: PresetTable, rawText: string): Promise<Preset> {
  const result = await db.runAsync(`INSERT INTO ${table} (raw_text) VALUES (?)`, rawText.trim());
  const row = await db.getFirstAsync<PresetRow>(`SELECT * FROM ${table} WHERE id = ?`, result.lastInsertRowId);
  if (!row) throw new Error('createPreset: row missing immediately after insert');
  return mapRow(row);
}

async function updatePreset(db: SQLiteDatabase, table: PresetTable, id: number, rawText: string): Promise<Preset> {
  await db.runAsync(`UPDATE ${table} SET raw_text = ? WHERE id = ?`, rawText.trim(), id);
  const row = await db.getFirstAsync<PresetRow>(`SELECT * FROM ${table} WHERE id = ?`, id);
  if (!row) throw new Error('updatePreset: row missing after update');
  return mapRow(row);
}

async function deletePreset(db: SQLiteDatabase, table: PresetTable, id: number): Promise<void> {
  await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, id);
}

export const listFoodPresets = (db: SQLiteDatabase) => listPresets(db, 'food_presets');
export const createFoodPreset = (db: SQLiteDatabase, rawText: string) => createPreset(db, 'food_presets', rawText);
export const updateFoodPreset = (db: SQLiteDatabase, id: number, rawText: string) =>
  updatePreset(db, 'food_presets', id, rawText);
export const deleteFoodPreset = (db: SQLiteDatabase, id: number) => deletePreset(db, 'food_presets', id);

export const listWorkoutPresets = (db: SQLiteDatabase) => listPresets(db, 'workout_presets');
export const createWorkoutPreset = (db: SQLiteDatabase, rawText: string) => createPreset(db, 'workout_presets', rawText);
export const updateWorkoutPreset = (db: SQLiteDatabase, id: number, rawText: string) =>
  updatePreset(db, 'workout_presets', id, rawText);
export const deleteWorkoutPreset = (db: SQLiteDatabase, id: number) => deletePreset(db, 'workout_presets', id);
