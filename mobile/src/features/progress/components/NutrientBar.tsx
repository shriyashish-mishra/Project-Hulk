import { View } from 'react-native';

import { Column, Row } from '@/components';
import { Caption } from '@/components/typography';
import { colors, radius } from '@/core/theme';

export interface NutrientBarProps {
  label: string;
  value: number;
  unit: string;
  /** A real target (from `features/profile/utils/targets.ts`) — when present, the bar fills toward this and the caption reads "value / target" instead of a vague fraction with nothing to compare against. */
  target: number | null;
}

/** Ported from the web app's target-aware `nutrient-bar.tsx`, minus the trailing-average line (mobile has no per-day history view to compute it against yet) — plain `View` bar, same convention as `Sparkline`/`MuscleBalanceSection`'s distribution rows, no charting dependency. */
export function NutrientBar({ label, value, unit, target }: NutrientBarProps) {
  const max = target ?? Math.max(value, 1) * 1.15;
  const pct = Math.min(100, (value / max) * 100);

  return (
    <Column gap="xs">
      <Row justify="space-between" align="baseline">
        <Caption color="mutedForeground">{label}</Caption>
        <Caption color="mutedForeground">
          {value}
          {unit}
          {target !== null && ` / ${target}${unit} target`}
        </Caption>
      </Row>
      <View style={{ height: 6, borderRadius: radius.full, backgroundColor: colors.muted, overflow: 'hidden' }}>
        <View style={{ height: '100%', borderRadius: radius.full, backgroundColor: colors.primary, width: `${pct}%` }} />
      </View>
    </Column>
  );
}
