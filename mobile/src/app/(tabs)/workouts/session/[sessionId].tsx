import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { Body, Button, Caption, Card, Column, Icon, Row, ScrollScreen, Title } from '@/components';
import { colors } from '@/core/theme';
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

/** Screen 3 — Active Workout Session. */
export default function ActiveWorkoutSessionScreen() {
  const { sessionId: sessionIdParam } = useLocalSearchParams<{ sessionId: string }>();
  const sessionId = Number(sessionIdParam);
  const {
    session,
    loading,
    elapsedMinutes,
    estimatedCalories,
    exercisesCompletedCount,
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

  return (
    <ScrollScreen>
      <Row align="center" gap="sm">
        <Button variant="ghost" size="sm" onPress={() => router.back()} accessibilityLabel="Back" leftIcon={<Icon name="chevronLeft" size={22} />} />
        <Title style={{ fontSize: 19, flexShrink: 1 }} numberOfLines={1}>
          {session.templateNameSnapshot}
        </Title>
      </Row>

      <Row gap="sm">
        <SummaryTile value={`${elapsedMinutes} min`} label="ELAPSED" />
        <SummaryTile value={String(estimatedCalories)} label="KCAL EST." />
        <SummaryTile value={`${exercisesCompletedCount} / ${session.exercises.length}`} label="EXERCISES" />
      </Row>

      <Column gap="sm">
        {session.exercises.map((exercise) => (
          <SessionExerciseCard
            key={exercise.id}
            exercise={exercise}
            onPressField={() => setEditingExercise(exercise)}
            onToggleSet={(setIndex) => toggleSet(exercise, setIndex)}
          />
        ))}
      </Column>

      <Button
        fullWidth
        loading={completing}
        leftIcon={<Icon name="check" color={colors.primaryForeground} size={16} />}
        onPress={handleComplete}
      >
        Complete Workout
      </Button>

      <SessionExerciseEditSheet
        visible={editingExercise !== null}
        onClose={() => setEditingExercise(null)}
        exercise={editingExercise}
        onSave={(updates) => (editingExercise ? updateExercise(editingExercise, updates) : Promise.resolve())}
      />
    </ScrollScreen>
  );
}
