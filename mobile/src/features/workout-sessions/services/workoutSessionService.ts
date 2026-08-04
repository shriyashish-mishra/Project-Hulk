import type { SQLiteDatabase } from 'expo-sqlite';

import { getTodayDateString } from '@/core/utils';
import { WorkoutService } from '@/features/workout/services';
import { WorkoutProgressService } from '@/features/workout-progress/services';
import { WorkoutTemplateService } from '@/features/workout-templates/services';
import {
  addSessionExercise,
  completeSession,
  createSession,
  getSessionWithExercises,
  updateSessionExercise,
} from '../repository';
import { buildCanonicalWorkoutText } from './canonicalTextGenerator';
import type { SessionExercise, SessionExerciseUpdate, WorkoutSessionWithExercises } from '../types';

// Rough, clearly-labeled estimates for the live "kcal est." tile and the
// figure stored on completion — not a validated MET-based formula, just
// enough to make the summary strip feel alive.
const CALORIES_PER_COMPLETED_SET = 5;
const CALORIES_PER_CARDIO_MINUTE = 6;

function estimateCalories(exercises: SessionExercise[]): number {
  return Math.round(
    exercises.reduce((total, exercise) => {
      if (exercise.category === 'cardio') {
        return total + (exercise.durationMinutes ?? 0) * CALORIES_PER_CARDIO_MINUTE;
      }
      return total + exercise.setsCompleted * CALORIES_PER_COMPLETED_SET;
    }, 0),
  );
}

export const WorkoutSessionService = {
  estimateCalories,

  /** Copies every one of the template's exercises into a fresh session, defaults and all — from here on, editing a session never touches the template. */
  async startFromTemplate(db: SQLiteDatabase, templateId: number): Promise<WorkoutSessionWithExercises> {
    const template = await WorkoutTemplateService.getTemplate(db, templateId);
    if (!template) {
      throw new Error(`startFromTemplate: template ${templateId} not found`);
    }

    const session = await createSession(db, {
      templateId: template.id,
      templateNameSnapshot: template.name,
      loggedOn: getTodayDateString(),
    });

    for (const templateExercise of template.exercises) {
      await addSessionExercise(db, session.id, templateExercise.exerciseId, templateExercise.position, {
        setsPlanned: templateExercise.defaultSets,
        reps: templateExercise.defaultReps,
        weight: templateExercise.defaultWeight,
        weightUnit: templateExercise.defaultWeightUnit,
        durationMinutes: templateExercise.defaultDurationMinutes,
        inclinePercent: templateExercise.defaultInclinePercent,
        speedKph: templateExercise.defaultSpeedKph,
        notes: templateExercise.notes,
      });
    }

    const result = await getSessionWithExercises(db, session.id);
    if (!result) throw new Error('startFromTemplate: session missing immediately after creation');
    return result;
  },

  async getSession(db: SQLiteDatabase, sessionId: number): Promise<WorkoutSessionWithExercises | null> {
    return getSessionWithExercises(db, sessionId);
  },

  async updateExercise(
    db: SQLiteDatabase,
    sessionExerciseId: number,
    updates: SessionExerciseUpdate,
  ): Promise<SessionExercise> {
    return updateSessionExercise(db, sessionExerciseId, updates);
  },

  /** Tapping a filled dot undoes back to it; tapping an empty one marks up through it — so finishing sets in order isn't required, but "undo the last one" and "mark several at once" both just work. */
  async toggleSet(db: SQLiteDatabase, exercise: SessionExercise, setIndex: number): Promise<SessionExercise> {
    const nextCompleted = setIndex < exercise.setsCompleted ? setIndex : setIndex + 1;
    return updateSessionExercise(db, exercise.id, { setsCompleted: nextCompleted });
  },

  /**
   * Marks the session complete and writes its canonical text through the
   * SAME `WorkoutService.saveWorkout` the manual free-text sheet calls —
   * `dailyContextBuilder.ts` reads `workout_logs.raw_text` exactly as
   * before, with no idea a template or session was ever involved.
   */
  async completeWorkout(db: SQLiteDatabase, session: WorkoutSessionWithExercises, elapsedMinutes: number): Promise<void> {
    const totalCalories = estimateCalories(session.exercises);
    await completeSession(db, session.id, totalCalories);
    await WorkoutProgressService.applyRecommendationsToTemplate(db, session);

    const canonicalText = buildCanonicalWorkoutText(session.templateNameSnapshot, session.exercises);
    await WorkoutService.saveWorkout(db, session.loggedOn, {
      workoutType: 'Strength',
      durationMinutes: elapsedMinutes,
      notes: canonicalText,
    });
  },
};
