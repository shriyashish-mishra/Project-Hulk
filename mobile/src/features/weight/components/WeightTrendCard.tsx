import { Card, Column, Row, Sparkline } from '@/components';
import { Body, Caption, Heading } from '@/components/typography';
import { useWeightHistory } from '../hooks';
import { formatTrendLabel } from '../utils';

/** Progress screen's weight section — a sparkline plus the same simple trend used in the history sheet, not a full chart. */
export function WeightTrendCard() {
  const { history, trend, loading } = useWeightHistory();

  if (!loading && history.length === 0) {
    return (
      <Card>
        <Body color="mutedForeground">No weigh-ins yet — log one from Home to start a trend.</Body>
      </Card>
    );
  }

  const latest = history[0];
  // Sparkline reads left-to-right as time moving forward; the history query returns newest first.
  const chronological = history.slice().reverse().map((entry) => entry.weightKg);

  return (
    <Card>
      <Column gap="base">
        <Row justify="space-between" align="baseline">
          <Column gap="xs">
            <Caption color="mutedForeground">Weight</Caption>
            {latest && <Heading>{latest.weightKg} kg</Heading>}
          </Column>
          {trend && (
            <Caption color={trend.direction === 'up' ? 'warning' : 'mutedForeground'}>
              {formatTrendLabel(trend.direction, trend.deltaKg)}
            </Caption>
          )}
        </Row>
        <Sparkline values={chronological} />
      </Column>
    </Card>
  );
}
