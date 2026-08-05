import type { SQLiteDatabase } from 'expo-sqlite';

import {
  createFoodPreset,
  createWorkoutPreset,
  deleteFoodPreset,
  deleteWorkoutPreset,
  listFoodPresets,
  listWorkoutPresets,
  updateFoodPreset,
  updateWorkoutPreset,
} from '../repository';
import type { Preset } from '../types';

export const PresetService = {
  async listFood(db: SQLiteDatabase): Promise<Preset[]> {
    return listFoodPresets(db);
  },
  async createFood(db: SQLiteDatabase, rawText: string): Promise<Preset> {
    return createFoodPreset(db, rawText);
  },
  async updateFood(db: SQLiteDatabase, id: number, rawText: string): Promise<Preset> {
    return updateFoodPreset(db, id, rawText);
  },
  async deleteFood(db: SQLiteDatabase, id: number): Promise<void> {
    return deleteFoodPreset(db, id);
  },

  async listWorkout(db: SQLiteDatabase): Promise<Preset[]> {
    return listWorkoutPresets(db);
  },
  async createWorkout(db: SQLiteDatabase, rawText: string): Promise<Preset> {
    return createWorkoutPreset(db, rawText);
  },
  async updateWorkout(db: SQLiteDatabase, id: number, rawText: string): Promise<Preset> {
    return updateWorkoutPreset(db, id, rawText);
  },
  async deleteWorkout(db: SQLiteDatabase, id: number): Promise<void> {
    return deleteWorkoutPreset(db, id);
  },
};
