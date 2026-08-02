import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  ActivityLevel,
  BiologicalSex,
  PrimaryGoal,
  Profile,
  ProfileUpdate,
  TrainingFrequency,
  UnitsPreference,
} from '../types';

interface ProfileRow {
  id: 1;
  display_name: string | null;
  date_of_birth: string | null;
  biological_sex: string | null;
  height_cm: number | null;
  primary_goal: string | null;
  activity_level: string | null;
  training_frequency: string | null;
  target_weight_kg: number | null;
  protein_target_g: number | null;
  units_preference: string;
  updated_at: string;
}

function mapRow(row: ProfileRow): Profile {
  return {
    id: row.id,
    displayName: row.display_name,
    dateOfBirth: row.date_of_birth,
    biologicalSex: row.biological_sex as BiologicalSex | null,
    heightCm: row.height_cm,
    primaryGoal: row.primary_goal as PrimaryGoal | null,
    activityLevel: row.activity_level as ActivityLevel | null,
    trainingFrequency: row.training_frequency as TrainingFrequency | null,
    targetWeightKg: row.target_weight_kg,
    proteinTargetG: row.protein_target_g,
    unitsPreference: row.units_preference as UnitsPreference,
    updatedAt: row.updated_at,
  };
}

const UPDATABLE_COLUMNS: Record<keyof ProfileUpdate, string> = {
  displayName: 'display_name',
  dateOfBirth: 'date_of_birth',
  biologicalSex: 'biological_sex',
  heightCm: 'height_cm',
  primaryGoal: 'primary_goal',
  activityLevel: 'activity_level',
  trainingFrequency: 'training_frequency',
  targetWeightKg: 'target_weight_kg',
  proteinTargetG: 'protein_target_g',
  unitsPreference: 'units_preference',
};

/** The migration seeds row id=1 unconditionally, so this never returns null in practice — typed as nullable only to keep the repository layer honest about what a raw query could theoretically return. */
export async function getProfile(db: SQLiteDatabase): Promise<Profile | null> {
  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
  return row ? mapRow(row) : null;
}

/** Builds the `SET` clause from whichever fields are present — a settings form saves one field at a time, not the whole profile every time. */
export async function updateProfile(db: SQLiteDatabase, updates: ProfileUpdate): Promise<Profile> {
  const entries = Object.entries(updates) as [keyof ProfileUpdate, string | number | null | undefined][];
  const present = entries.filter(([, value]) => value !== undefined);

  if (present.length > 0) {
    const setClause = present.map(([key]) => `${UPDATABLE_COLUMNS[key]} = ?`).join(', ');
    const values = present.map(([, value]) => value ?? null);
    await db.runAsync(
      `UPDATE profile SET ${setClause}, updated_at = datetime('now') WHERE id = 1`,
      ...values,
    );
  }

  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
  if (!row) throw new Error('updateProfile: singleton row missing — migration v7 should have seeded it');
  return mapRow(row);
}
