import { useState } from 'react';
import { router } from 'expo-router';

import { Button, Column, Icon, Row, ScrollScreen, Section, StatCard } from '@/components';
import { DateNavHeader } from '@/components/navigation';
import { Caption, Title } from '@/components/typography';
import { formatMonthLabel, getMonthStart, getTodayDateString, shiftMonth } from '@/core/utils';
import { deriveMuscleMapModel } from '@/features/profile/types';
import { MuscleBalanceSection, ProgressTabs } from '@/features/progress/components';
import { useProgressInsights } from '@/features/progress/hooks';
import { computeAverageScores } from '@/features/progress/utils';
import { WeightTrendCard } from '@/features/weight/components';

function monthEnd(monthStart: string): string {
  const [year, month] = monthStart.split('-').map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${monthStart.slice(0, 7)}-${String(lastDay).padStart(2, '0')}`;
}

function currentMonth(): string {
  return getMonthStart(getTodayDateString());
}

/** Progress — Monthly view. Same core sections as Weekly, computed over a full calendar month. */
export default function MonthlyProgressScreen() {
  const [monthStart, setMonthStart] = useState(currentMonth());
  const isCurrentMonth = monthStart === currentMonth();

  const { loading, reports, targets, regionCounts, musclesTrainedByDay } = useProgressInsights(
    monthStart,
    monthEnd(monthStart),
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
        label={formatMonthLabel(monthStart)}
        onPrev={() => setMonthStart(shiftMonth(monthStart, -1))}
        onNext={() => setMonthStart(shiftMonth(monthStart, 1))}
        nextDisabled={isCurrentMonth}
        jumpDateValue={monthStart}
        onJumpToDate={(date) => setMonthStart(getMonthStart(date))}
      />

      {!loading && !averageScores && (
        <Caption color="mutedForeground">No reports this month yet.</Caption>
      )}

      {!loading && averageScores && (
        <Section title="Month at a Glance">
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

      {!loading && regionCounts.size > 0 && (
        <Section title="Muscle Balance">
          <MuscleBalanceSection
            regionCounts={regionCounts}
            musclesTrainedByDay={musclesTrainedByDay}
            distributionLabel="This Month"
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
