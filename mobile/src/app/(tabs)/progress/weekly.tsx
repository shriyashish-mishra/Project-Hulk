import { useState } from 'react';
import { router } from 'expo-router';

import { Button, Column, Icon, Row, ScrollScreen, Section, StatCard } from '@/components';
import { DateNavHeader } from '@/components/navigation';
import { Caption, Title } from '@/components/typography';
import { addDays, formatWeekRangeLabel, getTodayDateString, getWeekStart } from '@/core/utils';
import { deriveMuscleMapModel } from '@/features/profile/types';
import { CalorieBalanceWeek, MuscleBalanceSection, ProgressTabs } from '@/features/progress/components';
import { useProgressInsights } from '@/features/progress/hooks';
import { computeAverageScores } from '@/features/progress/utils';
import { WeightTrendCard } from '@/features/weight/components';

const WEEK_LENGTH_DAYS = 7;

/** Progress — Weekly view. The same core sections as Daily, computed over a Monday-start week instead of one day, plus the score-average tiles absorbed from the old Insights tab's "This Week" section. */
export default function WeeklyProgressScreen() {
  const [weekStart, setWeekStart] = useState(getWeekStart(getTodayDateString()));
  const weekEnd = addDays(weekStart, WEEK_LENGTH_DAYS - 1);
  const isCurrentWeek = weekStart === getWeekStart(getTodayDateString());

  const { loading, reports, targets, regionCounts, musclesTrainedByDay, calorieBalance } = useProgressInsights(
    weekStart,
    weekEnd,
  );
  const averageScores = computeAverageScores(reports);

  return (
    <ScrollScreen>
      <Row justify="space-between" align="center">
        <Title>Progress</Title>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.push('/settings')}
          accessibilityLabel="Settings"
          leftIcon={<Icon name="settings" size={22} />}
        />
      </Row>

      <ProgressTabs />

      <DateNavHeader
        label={formatWeekRangeLabel(weekStart)}
        onPrev={() => setWeekStart(addDays(weekStart, -WEEK_LENGTH_DAYS))}
        onNext={() => setWeekStart(addDays(weekStart, WEEK_LENGTH_DAYS))}
        nextDisabled={isCurrentWeek}
        jumpDateValue={weekStart}
        onJumpToDate={(date) => setWeekStart(getWeekStart(date))}
      />

      {!loading && !averageScores && (
        <Caption color="mutedForeground">No reports this week yet.</Caption>
      )}

      {!loading && averageScores && (
        <Section title="Week at a Glance">
          <Row gap="base" wrap>
            <Column style={{ flex: 1, minWidth: 100 }}>
              <StatCard label="Nutrition" value={averageScores.nutrition} unit="/ 100" />
            </Column>
            <Column style={{ flex: 1, minWidth: 100 }}>
              <StatCard label="Activity" value={averageScores.activity} unit="/ 100" />
            </Column>
            <Column style={{ flex: 1, minWidth: 100 }}>
              <StatCard label="Recovery" value={averageScores.recovery} unit="/ 100" />
            </Column>
          </Row>
        </Section>
      )}

      {!loading && calorieBalance.some((d) => d.hasReport) && (
        <Section title="Calorie Balance">
          <CalorieBalanceWeek days={calorieBalance} />
        </Section>
      )}

      {!loading && regionCounts.size > 0 && (
        <Section title="Muscle Balance">
          <MuscleBalanceSection
            regionCounts={regionCounts}
            musclesTrainedByDay={musclesTrainedByDay}
            distributionLabel="This Week"
            muscleMapModel={deriveMuscleMapModel(targets?.profile?.biologicalSex ?? null)}
          />
        </Section>
      )}

      <Section title="Weight">
        <WeightTrendCard />
      </Section>
    </ScrollScreen>
  );
}
