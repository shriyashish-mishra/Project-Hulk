import { useState } from 'react';
import { Link } from 'expo-router';

import { AIReportSheet } from '@/features/ai/components';
import { useAIReport } from '@/features/ai/hooks';
import type { ClaudePromptPackage } from '@/features/ai/types';
import { Button, Card, Column, Icon, Row, ScrollScreen, Section, StatCard } from '@/components';
import { Body, Caption, Subtitle, Title } from '@/components/typography';
import { clipboard } from '@/core/clipboard';
import { sharing } from '@/core/sharing';
import { colors } from '@/core/theme';
import { FoodSheet } from '@/features/food/components';
import { useTodayFoodLogs } from '@/features/food/hooks';
import { useTodayJournalStatus } from '@/features/journal/hooks';
import { SleepSheet } from '@/features/sleep/components';
import { useSleepLog } from '@/features/sleep/hooks';
import { formatDuration } from '@/features/sleep/utils';
import { WaterQuickActionCard } from '@/features/water/components';
import { WeightQuickActionCard } from '@/features/weight/components';
import { WorkoutSheet } from '@/features/workout/components';
import { useWorkoutLog } from '@/features/workout/hooks';

/** Fixed by the `food_logs` schema's `meal_type` check constraint — breakfast/lunch/snacks/dinner. */
const MEAL_SECTION_COUNT = 4;

type ActiveSheet = 'food' | 'workout' | 'sleep' | null;

function formatTodayLabel(): string {
  return new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Home — a calm daily overview, not a checklist. Water and Weight stay
 * inline (fast, everyday habits worth surfacing directly); Food, Workout,
 * and Sleep are glance cards that open a focused sheet, since each needs
 * a moment of typing that doesn't belong inline on the home screen.
 */
export default function HomeScreen() {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const [aiSheetVisible, setAiSheetVisible] = useState(false);
  const [promptPackage, setPromptPackage] = useState<ClaudePromptPackage | null>(null);

  const { foodLogs, refresh: refreshFoodLogs } = useTodayFoodLogs();
  const { workoutLog, refresh: refreshWorkoutLog } = useWorkoutLog();
  const { sleepLog, refresh: refreshSleepLog } = useSleepLog();
  const { hasEntry: hasJournalEntry } = useTodayJournalStatus();
  const { preparing, prepareReport } = useAIReport();

  function closeSheet() {
    setActiveSheet(null);
    refreshFoodLogs();
    refreshWorkoutLog();
    refreshSleepLog();
  }

  async function handleGenerateReport() {
    const nextPromptPackage = await prepareReport();
    await clipboard.copy(nextPromptPackage.text);
    setPromptPackage(nextPromptPackage);
    setAiSheetVisible(true);
    // Fire-and-forget — if the user cancels the share sheet the prompt is
    // already on their clipboard, so there's nothing to recover from.
    sharing.share(nextPromptPackage.text);
  }

  return (
    <ScrollScreen>
      <Column gap="xs">
        <Title>Home</Title>
        <Body color="mutedForeground">{formatTodayLabel()}</Body>
      </Column>

      <Link href="/journal" asChild>
        <Card pressable accessibilityLabel="Continue journal">
          <Row justify="space-between" align="center">
            <Column gap="xs">
              <Subtitle>Continue Journal</Subtitle>
              <Caption color="mutedForeground">
                {hasJournalEntry ? 'Keep writing about today' : 'Write about today'}
              </Caption>
            </Column>
            <Icon name="chevronRight" color={colors.mutedForeground} />
          </Row>
        </Card>
      </Link>

      <Link href="/workout-templates" asChild>
        <Card pressable accessibilityLabel="Workout templates">
          <Row justify="space-between" align="center">
            <Column gap="xs">
              <Subtitle>Workout Templates</Subtitle>
              <Caption color="mutedForeground">Start from a saved plan</Caption>
            </Column>
            <Icon name="chevronRight" color={colors.mutedForeground} />
          </Row>
        </Card>
      </Link>

      <Section title="Your Day">
        <WaterQuickActionCard />
        <WeightQuickActionCard />

        <Row gap="base" wrap>
          <Column style={{ flex: 1, minWidth: 140 }}>
            <StatCard
              label="Food"
              value={`${foodLogs.length}/${MEAL_SECTION_COUNT}`}
              unit="meals"
              pressable
              onPress={() => setActiveSheet('food')}
            />
          </Column>
          <Column style={{ flex: 1, minWidth: 140 }}>
            <StatCard
              label="Workout"
              value={workoutLog ? 'Done' : 'Not yet'}
              pressable
              onPress={() => setActiveSheet('workout')}
            />
          </Column>
          <Column style={{ flex: 1, minWidth: 140 }}>
            <StatCard
              label="Sleep"
              value={sleepLog?.durationMinutes != null ? formatDuration(sleepLog.durationMinutes) : 'Not yet'}
              pressable
              onPress={() => setActiveSheet('sleep')}
            />
          </Column>
        </Row>
      </Section>

      <Section title="AI Coach">
        <Card>
          <Column gap="sm">
            <Body color="mutedForeground">
              Turn today&apos;s journal, meals, and activity into a short coaching report from Claude.
            </Body>
            <Button onPress={handleGenerateReport} loading={preparing} fullWidth>
              Generate Today&apos;s Report
            </Button>
          </Column>
        </Card>
      </Section>

      <FoodSheet visible={activeSheet === 'food'} onClose={closeSheet} />
      <WorkoutSheet visible={activeSheet === 'workout'} onClose={closeSheet} />
      <SleepSheet visible={activeSheet === 'sleep'} onClose={closeSheet} />
      <AIReportSheet
        visible={aiSheetVisible}
        onClose={() => setAiSheetVisible(false)}
        promptPackage={promptPackage}
      />
    </ScrollScreen>
  );
}
