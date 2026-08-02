import { Column, ScrollScreen, Section } from '@/components';
import { Body, Caption, Title } from '@/components/typography';
import {
  CalorieBalanceWeek,
  MuscleBalanceSection,
  NutrientBar,
  PhotoCaptureRow,
  PhotoGrid,
} from '@/features/progress/components';
import { useProgressInsights, useProgressPhotos } from '@/features/progress/hooks';
import { deriveMuscleMapModel } from '@/features/profile/types';
import { WeightTrendCard } from '@/features/weight/components';

export default function ProgressScreen() {
  const { photos, capturing, captureFromCamera, pickFromLibrary, deletePhoto, updateViewType } = useProgressPhotos();
  const { loading, todayReport, targets, regionCounts, musclesTrainedByDay, weekCalorieBalance } = useProgressInsights();

  const hasNutrition = todayReport?.estimatedCalories !== undefined;

  return (
    <ScrollScreen>
      <Column gap="xs">
        <Title>Progress</Title>
        <Body color="mutedForeground">Trends over time, not a single day.</Body>
      </Column>

      {!loading && hasNutrition && todayReport && (
        <Section title="Today's Nutrition">
          <Column gap="base">
            <NutrientBar
              label="Calories"
              value={todayReport.estimatedCalories!}
              unit=" kcal"
              target={targets?.calorieRangeKcal ? Math.round((targets.calorieRangeKcal.min + targets.calorieRangeKcal.max) / 2) : null}
            />
            {todayReport.proteinG !== undefined && (
              <NutrientBar label="Protein" value={todayReport.proteinG} unit="g" target={targets?.proteinTargetG ?? null} />
            )}
            {todayReport.carbsG !== undefined && (
              <NutrientBar label="Carbs" value={todayReport.carbsG} unit="g" target={targets?.carbsTargetG ?? null} />
            )}
            {todayReport.fatG !== undefined && (
              <NutrientBar label="Fat" value={todayReport.fatG} unit="g" target={targets?.fatTargetG ?? null} />
            )}
            {todayReport.fiberG !== undefined && (
              <NutrientBar label="Fibre" value={todayReport.fiberG} unit="g" target={targets?.fiberTargetG ?? null} />
            )}
          </Column>
        </Section>
      )}

      {!loading && weekCalorieBalance.some((d) => d.hasReport) && (
        <Section title="Calorie Balance">
          <CalorieBalanceWeek days={weekCalorieBalance} />
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

      {!loading && !hasNutrition && (
        <Section title="Progress Reports">
          <Caption color="mutedForeground">
            Generate a report from Home to start seeing your nutrition targets, calorie balance, and muscle balance
            here.
          </Caption>
        </Section>
      )}

      <Section title="Weight">
        <WeightTrendCard />
      </Section>

      <Section title="Progress Photos">
        <PhotoCaptureRow capturing={capturing} onCapture={captureFromCamera} onPickFromLibrary={pickFromLibrary} />
        <PhotoGrid photos={photos} onDelete={deletePhoto} onUpdateViewType={updateViewType} />
      </Section>
    </ScrollScreen>
  );
}
