import { Card, Column } from '@/components';
import { Caption, Label } from '@/components/typography';
import { LineChart, type LineChartPoint } from '@/components/dataviz';
import type { ExerciseHistoryEntry, WeightRecommendation } from '../types';
import { formatSessionShortDate } from '../utils';

export interface ProgressionChartProps {
  history: ExerciseHistoryEntry[];
  recommendation: WeightRecommendation;
}

/** Actual weight per completed session (oldest to newest) plus a dashed continuation to the next-weight recommendation — the same number the recommendation card shows, so the two never disagree. */
export function ProgressionChart({ history, recommendation }: ProgressionChartProps) {
  const withWeight = history.filter((entry): entry is ExerciseHistoryEntry & { weight: number } => entry.weight !== null);
  const actual: LineChartPoint[] = withWeight
    .slice()
    .reverse()
    .map((entry) => ({ value: entry.weight, label: formatSessionShortDate(entry.completedAt) }));

  const projected: LineChartPoint[] =
    recommendation.action === 'increase' && recommendation.nextWeight !== null
      ? [{ value: recommendation.nextWeight, label: 'Next' }]
      : [];

  if (actual.length === 0) {
    return (
      <Card>
        <Caption color="mutedForeground">No completed sessions yet — this chart fills in as you log workouts.</Caption>
      </Card>
    );
  }

  return (
    <Card>
      <Column gap="sm">
        <Label color="mutedForeground">Weight Progress</Label>
        <LineChart actual={actual} projected={projected} />
      </Column>
    </Card>
  );
}
