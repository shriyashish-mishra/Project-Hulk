import { View } from 'react-native';

import { Column, Row } from '@/components';
import { Body, Caption } from '@/components/typography';
import { colors, radius } from '@/core/theme';
import { formatWeekdayShort } from '@/core/utils';
import type { DayCalorieBalance } from '../hooks/useProgressInsights';

const BAR_AREA_HEIGHT = 64;

function formatBalance(value: number): string {
  return value > 0 ? `+${value}` : `${value}`;
}

/** The week's calorie balance as a row of plain `View` bars — same no-charting-library convention as `Sparkline`. Deficit days are mint, surplus days amber, and a day with no report at all gets a dashed placeholder rather than a flat zero-height bar (which would otherwise be indistinguishable from "no deficit"). */
export function CalorieBalanceWeek({ days }: { days: DayCalorieBalance[] }) {
  const values = days.map((d) => d.balanceKcal).filter((v): v is number => v !== null);

  if (values.length === 0) {
    return <Caption color="mutedForeground">No calorie balance data yet — generate a report to see this.</Caption>;
  }

  const maxAbs = Math.max(100, ...values.map((v) => Math.abs(v)));

  return (
    <Row gap="sm" align="flex-end">
      {days.map((day) => {
        const barHeight = day.balanceKcal !== null ? Math.max(4, (Math.abs(day.balanceKcal) / maxAbs) * BAR_AREA_HEIGHT) : 0;
        const isSurplus = (day.balanceKcal ?? 0) > 0;

        return (
          <Column key={day.date} align="center" gap="xs" style={{ flex: 1 }}>
            <View style={{ height: BAR_AREA_HEIGHT, width: '100%', justifyContent: 'flex-end' }}>
              {day.balanceKcal !== null ? (
                <View
                  style={{
                    height: barHeight,
                    borderRadius: radius.sm,
                    backgroundColor: isSurplus ? colors.warning : colors.success,
                  }}
                />
              ) : day.hasReport ? null : (
                <View
                  style={{
                    height: 24,
                    borderRadius: radius.sm,
                    borderWidth: 1,
                    borderStyle: 'dashed',
                    borderColor: colors.border,
                  }}
                />
              )}
            </View>
            <Body weight="semiBold" style={{ fontSize: 10 }}>
              {day.balanceKcal !== null ? formatBalance(day.balanceKcal) : day.hasReport ? 'n/a' : ''}
            </Body>
            <Caption color="mutedForeground" style={{ fontSize: 10 }}>
              {formatWeekdayShort(day.date)}
            </Caption>
          </Column>
        );
      })}
    </Row>
  );
}
