import { View } from 'react-native';

import { colors, radius, spacing } from '@/core/theme';

export interface SparklineProps {
  /** Oldest first — rendered left to right in the order given. */
  values: number[];
  height?: number;
  color?: string;
}

/**
 * A minimal bar-based trend visualization — proportionally-sized bars,
 * no axes, no labels, no charting library. Good for "is this going up or
 * down at a glance," which is all a trend sparkline needs to answer.
 */
export function Sparkline({ values, height = 48, color = colors.primary }: SparklineProps) {
  if (values.length === 0) {
    return null;
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: spacing.xs, height }}>
      {values.map((value, index) => {
        const ratio = (value - min) / range;
        const barHeight = Math.max(4, ratio * height);
        return (
          <View
            key={index}
            style={{
              flex: 1,
              height: barHeight,
              backgroundColor: color,
              borderRadius: radius.sm,
              opacity: 0.4 + ratio * 0.6,
            }}
          />
        );
      })}
    </View>
  );
}
