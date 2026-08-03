import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';

import { Body, Caption, Card, Column, Row, ScrollScreen, Title } from '@/components';
import { formatSessionFullDate } from '@/features/workout-progress/utils';
import { WorkoutProgressService } from '@/features/workout-progress/services';
import { WorkoutsTabs } from '@/features/workouts/components';
import type { WorkoutSession } from '@/features/workout-sessions/types';

/** Full history of completed workout sessions — every "Start Workout" that was seen through to "Complete Workout," newest first. */
export default function WorkoutHistoryScreen() {
  const db = useSQLiteContext();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    WorkoutProgressService.getCompletedSessions(db).then((result) => {
      setSessions(result);
      setLoading(false);
    });
  }, [db]);

  return (
    <ScrollScreen>
      <Title>Workouts</Title>
      <WorkoutsTabs />

      {!loading && sessions.length === 0 && (
        <Caption color="mutedForeground">No completed workouts yet — finish a session to see it here.</Caption>
      )}

      <Column gap="sm">
        {sessions.map((session) => (
          <Card
            key={session.id}
            pressable
            onPress={() => router.push(`/workouts/session/${session.id}`)}
            accessibilityLabel={`${session.templateNameSnapshot}, ${formatSessionFullDate(session.completedAt ?? session.startedAt)}`}
          >
            <Row justify="space-between" align="center">
              <Column gap="xs">
                <Body weight="semiBold">{session.templateNameSnapshot}</Body>
                <Caption color="mutedForeground">
                  {formatSessionFullDate(session.completedAt ?? session.startedAt)}
                </Caption>
              </Column>
              {session.totalCalories !== null && <Caption color="mutedForeground">{session.totalCalories} kcal</Caption>}
            </Row>
          </Card>
        ))}
      </Column>
    </ScrollScreen>
  );
}
