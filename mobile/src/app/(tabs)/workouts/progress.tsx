import { useState } from 'react';

import { Column, ScrollScreen } from '@/components';
import { Caption, Title } from '@/components/typography';
import { WorkoutsTabs } from '@/features/workouts/components';
import {
  ExerciseHistoryList,
  ExerciseOverviewRow,
  ExercisePickerStrip,
  InsightBanner,
  PersonalRecordsRow,
  ProgressionChart,
  RecommendationCard,
} from '@/features/workout-progress/components';
import { useExerciseProgress, useRecentExercises } from '@/features/workout-progress/hooks';

/**
 * Per-exercise progression — not a generic analytics dashboard, scoped
 * to exercises the user already trains inside their templates. Section
 * order follows the spec exactly: picker → overview → chart →
 * recommendation → personal records → session history → insight.
 */
export default function WorkoutProgressScreen() {
  const { exercises, loading: exercisesLoading } = useRecentExercises();
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);

  const activeExerciseId = selectedExerciseId ?? exercises[0]?.exerciseId ?? null;
  const selectedExercise = exercises.find((exercise) => exercise.exerciseId === activeExerciseId) ?? null;
  const { summary, loading: summaryLoading } = useExerciseProgress(selectedExercise);

  return (
    <ScrollScreen>
      <Title>Workouts</Title>
      <WorkoutsTabs />

      {!exercisesLoading && exercises.length === 0 && (
        <Caption color="mutedForeground">
          Complete a workout session with a strength exercise to start seeing progression here.
        </Caption>
      )}

      {exercises.length > 0 && (
        <ExercisePickerStrip
          exercises={exercises}
          selectedExerciseId={activeExerciseId}
          onSelect={setSelectedExerciseId}
        />
      )}

      {!summaryLoading && summary && (
        <Column gap="base">
          <ExerciseOverviewRow history={summary.history} personalRecords={summary.personalRecords} trend={summary.trend} />
          <ProgressionChart history={summary.history} recommendation={summary.recommendation} />
          <RecommendationCard recommendation={summary.recommendation} unit={summary.exercise.defaultUnit} />
          <PersonalRecordsRow personalRecords={summary.personalRecords} unit={summary.exercise.defaultUnit} />
          <ExerciseHistoryList history={summary.history} />
          <InsightBanner insight={summary.insight} />
        </Column>
      )}
    </ScrollScreen>
  );
}
