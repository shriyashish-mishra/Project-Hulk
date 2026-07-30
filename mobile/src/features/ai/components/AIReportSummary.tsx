import { Column, Row, StatCard } from '@/components';
import { Body, Caption, Label } from '@/components/typography';
import type { AIReport } from '../types';

export interface AIReportSummaryProps {
  report: AIReport;
  parseWarnings: string[];
}

function BulletList({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  return (
    <Column gap="xs">
      {items.map((item, index) => (
        <Body key={index}>{`• ${item}`}</Body>
      ))}
    </Column>
  );
}

/** A saved report's full display — summary, scores, and every section the prompt asked Claude for. Pure presentation, no data fetching. */
export function AIReportSummary({ report, parseWarnings }: AIReportSummaryProps) {
  return (
    <Column gap="lg">
      {parseWarnings.length > 0 && (
        <Caption color="mutedForeground">
          Some of this report couldn&apos;t be read perfectly from Claude&apos;s reply, so a few fields used safe
          defaults.
        </Caption>
      )}

      <Body>{report.summary}</Body>

      <Row gap="sm">
        <Column style={{ flex: 1 }}>
          <StatCard label="Nutrition" value={report.scores.nutrition} unit="/ 100" />
        </Column>
        <Column style={{ flex: 1 }}>
          <StatCard label="Activity" value={report.scores.activity} unit="/ 100" />
        </Column>
        <Column style={{ flex: 1 }}>
          <StatCard label="Recovery" value={report.scores.recovery} unit="/ 100" />
        </Column>
      </Row>

      {report.wins.length > 0 && (
        <Column gap="xs">
          <Label color="mutedForeground">Wins</Label>
          <BulletList items={report.wins} />
        </Column>
      )}

      {report.improvements.length > 0 && (
        <Column gap="xs">
          <Label color="mutedForeground">Improvements</Label>
          <BulletList items={report.improvements} />
        </Column>
      )}

      {report.nutritionFeedback.length > 0 && (
        <Column gap="xs">
          <Label color="mutedForeground">Nutrition</Label>
          <Body color="mutedForeground">{report.nutritionFeedback}</Body>
        </Column>
      )}

      {report.workoutFeedback.length > 0 && (
        <Column gap="xs">
          <Label color="mutedForeground">Workout</Label>
          <Body color="mutedForeground">{report.workoutFeedback}</Body>
        </Column>
      )}

      {report.recoveryFeedback.length > 0 && (
        <Column gap="xs">
          <Label color="mutedForeground">Recovery</Label>
          <Body color="mutedForeground">{report.recoveryFeedback}</Body>
        </Column>
      )}

      {report.tomorrowSuggestions.length > 0 && (
        <Column gap="xs">
          <Label color="mutedForeground">Tomorrow</Label>
          <BulletList items={report.tomorrowSuggestions} />
        </Column>
      )}
    </Column>
  );
}
