import { Card, Column, Row } from '@/components';
import { Body, Caption } from '@/components/typography';
import type { AIReport } from '../types';

export interface AIReportHistoryItemProps {
  report: AIReport;
  onPress: () => void;
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** One row in the Insights history list — date, a one-line summary, and the three scores at a glance. */
export function AIReportHistoryItem({ report, onPress }: AIReportHistoryItemProps) {
  return (
    <Card pressable onPress={onPress} accessibilityLabel={`View report from ${formatDate(report.date)}`}>
      <Column gap="xs">
        <Row justify="space-between" align="center">
          <Caption color="mutedForeground">{formatDate(report.date)}</Caption>
          <Caption color="mutedForeground">
            {report.scores.nutrition} · {report.scores.activity} · {report.scores.recovery}
          </Caption>
        </Row>
        <Body numberOfLines={2}>{report.summary}</Body>
      </Column>
    </Card>
  );
}
