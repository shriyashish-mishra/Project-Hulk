import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { Body, Button, Caption, Card, Column, Icon, Row, ScrollScreen, Title } from '@/components';
import { colors } from '@/core/theme';
import { formatSessionFullDate } from '@/features/workout-progress/utils';
import { SessionExerciseCard, SessionExerciseEditSheet } from '@/features/workout-sessions/components';
import { useWorkoutSession } from '@/features/workout-sessions/hooks';
import type { SessionExercise } from '@/features/workout-sessions/types';

function SummaryTile({ value, label }: { value: string; label: string }) {
  return (
    <Card style={{ flex: 1, alignItems: 'center', paddingVertical: 12 }}>
      <Body weight="bold" style={{ fontSize: 15 }}>
        {value}
      </Body>
      <Caption color="mutedForeground" style={{ fontSize: 10 }}>
        {label}
      </Caption>
    </Card>
  );
}

/** `started_at`/`completed_at` are SQLite `datetime('now')` strings — UTC, space-separated. */
function parseSqliteUtc(value: string): number {
  return new Date(`${value.replace(' ', 'T')}Z`).getTime();
}

/** Screen 3 — Active Workout Session, or a read-only summary once `completedAt` is set (reused by both the Workouts History and Progress tabs' "view this session" links, so there's one route for "view a session" rather than two near-identical screens). */
export default function WorkoutSessionScreen() {
  const { sessionId: sessionIdParam } = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Number(sessionIdParam);
  const {
    session,
    loading,
    elapsedMinutes,
    estimatedCalories,
    exercisesCompletedCount,
    weightSuggestions,
    updateExercise,
    toggleSet,
    complete,
    completing,
  } = useWorkoutSession(sessionId);

  const [editingExercise, setEditingExercise] = useState<SessionExercise | null>(null);

  async function handleComplete() {
    await complete();
    router.replace('/workouts');
  }

  if (loading || !session) {
    return (
      <ScrollScreen>
        <Body color="mutedForeground">Loading…</Body>
      </ScrollScreen>
    );
  }

  const isCompleted = session.completedAt !== null;
  const durationMinutes = isCompleted
    ? Math.max(1, Math.round((parseSqliteUtc(session.completedAt as string) - parseSqliteUtc(session.startedAt)) / 60000))
    : elapsedMinutes;

  return (
    <ScrollScreen>
      <Row align="center" gap="sm">
        <Button variant="ghost" size="sm" onPress={() => router.back()} accessibilityLabel="Back" leftIcon={<Icon name="chevronLeft" size={22} />} />
        <Title style={{ fontSize: 19, flexShrink: 1 }} numberOfLines={1}>
          {session.templateNameSnapshot}
        </Title>
      </Row>

      <Row gap="sm">
        <SummaryTile value={`${durationMinutes} min`} label={isCompleted ? 'DURATION' : 'ELAPSED'} />
        <SummaryTile value={String(session.totalCalories ?? estimatedCalories)} label="KCAL" />
        <SummaryTile value={`${exercisesCompletedCount} / ${session.exercises.length}`} label="EXERCISES" />
      </Row>

      <Column gap="sm">
        {session.exercises.map((exercise) => (
          <SessionExerciseCard
            key={exercise.id}
            exercise={exercise}
            onPressField={() => setEditingExercise(exercise)}
            onToggleSet={(setIndex) => toggleSet(exercise, setIndex)}
            readOnly={isCompleted}
            weightSuggestion={weightSuggestions[exercise.id]}
          />
        ))}
      </Column>

      {isCompleted ? (
        <Caption color="mutedForeground" align="center">
          Completed {formatSessionFullDate(session.completedAt as string)}
        </Caption>
      ) : (
        <Button
          fullWidth
          loading={completing}
          leftIcon={<Icon name="check" color={colors.primaryForeground} size={16} />}
          onPress={handleComplete}
        >
          Complete Workout
        </Button>
      )}

      {!isCompleted && (
        <SessionExerciseEditSheet
          visible={editingExercise !== null}
          onClose={() => setEditingExercise(null)}
          exercise={editingExercise}
          onSave={(updates) => (editingExercise ? updateExercise(editingExercise, updates) : Promise.resolve())}
        />
      )}
    </ScrollScreen>
  );
}
