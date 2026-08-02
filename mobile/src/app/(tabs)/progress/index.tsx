import { useState } from 'react';
import { router } from 'expo-router';

import { Button, Column, Icon, Row, ScrollScreen, Section } from '@/components';
import { EmptyState } from '@/components/feedback';
import { DateNavHeader } from '@/components/navigation';
import { Title } from '@/components/typography';
import { addDays, formatShortDateWithWeekday, getTodayDateString } from '@/core/utils';
import { AIReportSummary } from '@/features/ai/components';
import { deriveMuscleMapModel } from '@/features/profile/types';
import {
  CalorieBalanceWeek,
  MuscleBalanceSection,
  NutrientBar,
  PhotoCaptureRow,
  PhotoGrid,
  ProgressTabs,
} from '@/features/progress/components';
import { useDatePhotos, useProgressInsights } from '@/features/progress/hooks';
import { WeightTrendCard } from '@/features/weight/components';

function headerLabel(date: string): string {
  return date === getTodayDateString() ? 'Today' : formatShortDateWithWeekday(date);
}

/** Progress — Daily view. Mirrors web's day-scoped Progress: one day's nutrition, calorie balance, muscle balance, and full report detail — plus this is where report-detail viewing lives now, replacing the old Insights tab's list-of-reports browsing with "navigate to that day." */
export default function DailyProgressScreen() {
  const [date, setDate] = useState(getTodayDateString());
  const isToday = date === getTodayDateString();

  const { loading, focusReport, targets, regionCounts, musclesTrainedByDay, calorieBalance } = useProgressInsights(
    date,
    date,
  );
  const { photos, capturing, captureFromCamera, pickFromLibrary, deletePhoto, updateViewType } = useDatePhotos(date);

  const hasNutrition = focusReport?.estimatedCalories !== undefined;

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
        label={headerLabel(date)}
        onPrev={() => setDate(addDays(date, -1))}
        onNext={() => setDate(addDays(date, 1))}
        nextDisabled={isToday}
        jumpDateValue={date}
        onJumpToDate={setDate}
      />

      {!loading && focusReport && (
        <Section title="Report">
          <AIReportSummary report={focusReport} parseWarnings={[]} />
        </Section>
      )}

      {!loading && !focusReport && (
        <EmptyState
          icon="insights"
          title="No report for this day"
          description="Generate one from the Journal dashboard to see nutrition, calorie balance, and muscle balance here."
          actionLabel="Go to Journal"
          onAction={() => router.push(isToday ? '/journal' : `/journal/${date}`)}
        />
      )}

      {!loading && hasNutrition && focusReport && (
        <Section title="Nutrition">
          <Column gap="base">
            <NutrientBar
              label="Calories"
              value={focusReport.estimatedCalories!}
              unit=" kcal"
              target={
                targets?.calorieRangeKcal
                  ? Math.round((targets.calorieRangeKcal.min + targets.calorieRangeKcal.max) / 2)
                  : null
              }
            />
            {focusReport.proteinG !== undefined && (
              <NutrientBar label="Protein" value={focusReport.proteinG} unit="g" target={targets?.proteinTargetG ?? null} />
            )}
            {focusReport.carbsG !== undefined && (
              <NutrientBar label="Carbs" value={focusReport.carbsG} unit="g" target={targets?.carbsTargetG ?? null} />
            )}
            {focusReport.fatG !== undefined && (
              <NutrientBar label="Fat" value={focusReport.fatG} unit="g" target={targets?.fatTargetG ?? null} />
            )}
            {focusReport.fiberG !== undefined && (
              <NutrientBar label="Fibre" value={focusReport.fiberG} unit="g" target={targets?.fiberTargetG ?? null} />
            )}
          </Column>
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
            distributionLabel="This Day"
            muscleMapModel={deriveMuscleMapModel(targets?.profile?.biologicalSex ?? null)}
          />
        </Section>
      )}

      <Section title="Weight">
        <WeightTrendCard />
      </Section>

      <Section title="Photos">
        <PhotoCaptureRow capturing={capturing} onCapture={captureFromCamera} onPickFromLibrary={pickFromLibrary} />
        <PhotoGrid photos={photos} onDelete={deletePhoto} onUpdateViewType={updateViewType} />
      </Section>
    </ScrollScreen>
  );
}
