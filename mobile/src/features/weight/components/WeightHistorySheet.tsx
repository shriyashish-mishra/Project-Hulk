import { Column, Row } from '@/components';
import { Sheet } from '@/components/dialog';
import { Body, Caption } from '@/components/typography';
import { colors } from '@/core/theme';
import { useWeightHistory } from '../hooks';
import { formatShortDate, formatTrendLabel } from '../utils';

export interface WeightHistorySheetProps {
  visible: boolean;
  onClose: () => void;
}

/** The detail view Home's inline quick-entry card doesn't have room for — recent entries plus a simple trend, not a chart. */
export function WeightHistorySheet({ visible, onClose }: WeightHistorySheetProps) {
  const { history, trend, loading } = useWeightHistory();

  return (
    <Sheet visible={visible} title="Weight History" onClose={onClose}>
      <Column gap="lg">
        {trend && (
          <Body color={trend.direction === 'up' ? 'warning' : 'mutedForeground'}>
            {formatTrendLabel(trend.direction, trend.deltaKg)}
          </Body>
        )}

        {!loading && history.length === 0 && (
          <Body color="mutedForeground">No weigh-ins yet.</Body>
        )}

        <Column gap="sm">
          {history.map((entry) => (
            <Row
              key={entry.id}
              justify="space-between"
              style={{ borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 8 }}
            >
              <Body>{entry.weightKg} kg</Body>
              <Caption color="mutedForeground">{formatShortDate(entry.measuredOn)}</Caption>
            </Row>
          ))}
        </Column>
      </Column>
    </Sheet>
  );
}
