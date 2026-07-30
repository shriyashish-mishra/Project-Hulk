import type { SQLiteDatabase } from 'expo-sqlite';

import {
  addTemplateExercise,
  createTemplate,
  deleteTemplate,
  getTemplateWithExercises,
  listTemplates,
  moveTemplateExercise,
  removeTemplateExercise,
  renameTemplate,
  updateTemplateExercise,
} from '../repository';
import type { TemplateExerciseInput, WorkoutTemplate, WorkoutTemplateWithExercises } from '../types';

const DEFAULT_TEMPLATE_NAME = 'New Template';

export const WorkoutTemplateService = {
  async listTemplates(db: SQLiteDatabase): Promise<WorkoutTemplate[]> {
    return listTemplates(db);
  },

  async getTemplate(db: SQLiteDatabase, templateId: number): Promise<WorkoutTemplateWithExercises | null> {
    return getTemplateWithExercises(db, templateId);
  },

  async createTemplate(db: SQLiteDatabase, name: string): Promise<WorkoutTemplate> {
    return createTemplate(db, name.trim() || DEFAULT_TEMPLATE_NAME);
  },

  async renameTemplate(db: SQLiteDatabase, templateId: number, name: string): Promise<void> {
    return renameTemplate(db, templateId, name.trim() || DEFAULT_TEMPLATE_NAME);
  },

  async deleteTemplate(db: SQLiteDatabase, templateId: number): Promise<void> {
    return deleteTemplate(db, templateId);
  },

  async addExercise(db: SQLiteDatabase, templateId: number, exerciseId: number, input: TemplateExerciseInput) {
    return addTemplateExercise(db, templateId, exerciseId, input);
  },

  async updateExercise(db: SQLiteDatabase, templateExerciseId: number, input: TemplateExerciseInput) {
    return updateTemplateExercise(db, templateExerciseId, input);
  },

  async removeExercise(db: SQLiteDatabase, templateExerciseId: number): Promise<void> {
    return removeTemplateExercise(db, templateExerciseId);
  },

  async moveExercise(
    db: SQLiteDatabase,
    templateId: number,
    templateExerciseId: number,
    direction: 'up' | 'down',
  ): Promise<void> {
    return moveTemplateExercise(db, templateId, templateExerciseId, direction);
  },
};
