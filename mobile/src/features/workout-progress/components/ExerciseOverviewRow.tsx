import { Column, Row, StatCard } from '@/components';
import type { ExerciseHistoryEntry, ExerciseTrend, PersonalRecords } from '../types';

export interface ExerciseOverviewRowProps {
  history: ExerciseHistoryEntry[];
  personalRecords: PersonalRecords;
  trend: ExerciseTrend | null;
}

function trendLabel(trend: ExerciseTrend | null): string {
  if (!trend) return 'Not enough data';
  if (trend.direction === 'up') return `Improving ↑`;
  if (trend.direction === 'down') return `Declining ↓`;
  return 'Steady →';
}

/** Current weight, best weight ever, last session's line, and a trend read — the "at a glance" row at the top of an exercise's progression. */
export function ExerciseOverviewRow({ history, personalRecords, trend }: ExerciseOverviewRowProps) {
  const latest = history[0] ?? null;

  return (
    <Column gap="sm">
      <Row gap="sm" wrap>
        <Column style={{ flex: 1, minWidth: 140 }}>
          <StatCard
            label="Current Weight"
            value={latest?.weight ?? '—'}
            unit={latest?.weightUnit ?? undefined}
          />
        </Column>
        <Column style={{ flex: 1, minWidth: 140 }}>
          <StatCard
            label="Best Weight"
            value={personalRecords.maxWeight?.value ?? '—'}
            unit={personalRecords.maxWeight?.unit}
          />
        </Column>
      </Row>
      <Row gap="sm" wrap>
        <Column style={{ flex: 1, minWidth: 140 }}>
          <StatCard
            label="Last Session"
            value={latest ? `${latest.weight ?? '—'}${latest.weightUnit ?? ''} × ${latest.reps ?? '—'}` : '—'}
            unit={latest ? `× ${latest.setsCompleted} sets` : undefined}
          />
        </Column>
        <Column style={{ flex: 1, minWidth: 140 }}>
          <StatCard label="Trend" value={trendLabel(trend)} />
        </Column>
      </Row>
    </Column>
  );
}
