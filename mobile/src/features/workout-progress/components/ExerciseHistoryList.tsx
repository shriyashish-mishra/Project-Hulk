import { router } from 'expo-router';

import { Card, Column, Row, Section } from '@/components';
import { Body, Caption } from '@/components/typography';
import type { ExerciseHistoryEntry } from '../types';
import { formatSessionShortDate } from '../utils';

export interface ExerciseHistoryListProps {
  history: ExerciseHistoryEntry[];
}

/** Every completed session where this exercise appeared — tapping a row opens that session's read-only detail. */
export function ExerciseHistoryList({ history }: ExerciseHistoryListProps) {
  if (history.length === 0) {
    return (
      <Section title="Session History">
        <Caption color="mutedForeground">No completed sessions yet.</Caption>
      </Section>
    );
  }

  return (
    <Section title="Session History">
      <Column gap="sm">
        {history.map((entry) => (
          <Card
            key={entry.sessionId}
            pressable
            onPress={() => router.push(`/workouts/session/${entry.sessionId}`)}
            accessibilityLabel={`Session on ${formatSessionShortDate(entry.completedAt)}`}
          >
            <Row justify="space-between" align="center">
              <Body weight="semiBold">{formatSessionShortDate(entry.completedAt)}</Body>
              <Row gap="sm" align="baseline">
                <Body>{entry.weight !== null ? `${entry.weight}${entry.weightUnit ?? ''}` : '—'}</Body>
                <Caption color="mutedForeground">
                  {entry.setsCompleted} × {entry.reps ?? '—'}
                </Caption>
              </Row>
            </Row>
          </Card>
        ))}
      </Column>
    </Section>
  );
}
