import { View } from 'react-native';

import { Column, Row } from '@/components';
import { Body, Caption, Label } from '@/components/typography';
import { colors, radius, spacing } from '@/core/theme';
import type { MuscleMapModel } from '@/features/profile/types';
import { MuscleMap } from '../anatomy';
import { computeMuscleGroupIntensity } from '../utils/muscleGroups';
import { ALL_MUSCLE_REGIONS, MUSCLE_REGION_LABEL, type MuscleRegion } from '../utils/muscleRegions';

function DistributionRow({ label, count, maxCount }: { label: string; count: number; maxCount: number }) {
  const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
  return (
    <Row align="center" gap="md">
      <Caption color="mutedForeground" style={{ width: 80 }}>
        {label}
      </Caption>
      <View style={{ flex: 1, height: 6, borderRadius: radius.full, backgroundColor: colors.muted, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: radius.full, backgroundColor: colors.primary, width: `${pct}%` }} />
      </View>
      <Caption color="mutedForeground" style={{ width: 16, textAlign: 'right' }}>
        {count}
      </Caption>
    </Row>
  );
}

function InsightRow({ label, value }: { label: string; value: string }) {
  return (
    <Row justify="space-between" align="baseline">
      <Caption color="mutedForeground">{label}</Caption>
      <Body weight="semiBold" style={{ textAlign: 'right' }}>
        {value}
      </Body>
    </Row>
  );
}

export interface MuscleBalanceSectionProps {
  regionCounts: Map<MuscleRegion, number>;
  musclesTrainedByDay: string[][];
  distributionLabel: string;
  muscleMapModel?: MuscleMapModel;
}

/** Ported from the web app's `muscle-balance-section.tsx` — same distribution-row/insight-row logic, mobile design-system primitives. */
export function MuscleBalanceSection({
  regionCounts,
  musclesTrainedByDay,
  distributionLabel,
  muscleMapModel,
}: MuscleBalanceSectionProps) {
  const intensity = computeMuscleGroupIntensity(musclesTrainedByDay);
  const ranked = [...ALL_MUSCLE_REGIONS].sort((a, b) => (regionCounts.get(b) ?? 0) - (regionCounts.get(a) ?? 0));
  const maxCount = Math.max(1, ...Array.from(regionCounts.values()));

  const trainedRegions = ranked.filter((r) => (regionCounts.get(r) ?? 0) > 0);
  const mostTrained = trainedRegions.length > 0 ? MUSCLE_REGION_LABEL[trainedRegions[0]] : null;
  const leastTrained =
    trainedRegions.length > 0 ? MUSCLE_REGION_LABEL[trainedRegions[trainedRegions.length - 1]] : null;
  const neglected = ranked.filter((r) => (regionCounts.get(r) ?? 0) === 0).map((r) => MUSCLE_REGION_LABEL[r]);
  const recoveryBalance = neglected.length === 0 ? 'Well balanced' : neglected.length <= 2 ? 'Good' : 'Needs attention';

  return (
    <Column gap="lg">
      <MuscleMap intensity={intensity} size="lg" model={muscleMapModel} />

      <Column gap="sm">
        <Label color="mutedForeground">{distributionLabel}</Label>
        <Column gap="md">
          {ranked.map((region) => (
            <DistributionRow
              key={region}
              label={MUSCLE_REGION_LABEL[region]}
              count={regionCounts.get(region) ?? 0}
              maxCount={maxCount}
            />
          ))}
        </Column>
      </Column>

      <Column gap="sm" style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.base }}>
        <InsightRow label="Most Trained" value={mostTrained ?? '—'} />
        <InsightRow label="Least Trained" value={leastTrained ?? '—'} />
        <InsightRow label="Neglected" value={neglected.length > 0 ? neglected.join(', ') : 'None'} />
        <InsightRow label="Recovery Balance" value={recoveryBalance} />
      </Column>
    </Column>
  );
}
