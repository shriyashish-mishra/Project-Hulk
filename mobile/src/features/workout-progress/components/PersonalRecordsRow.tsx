import { Column, Row, Section, StatCard } from '@/components';
import type { WeightUnit } from '@/features/exercise-library/types';
import type { PersonalRecords } from '../types';

export interface PersonalRecordsRowProps {
  personalRecords: PersonalRecords;
  unit: WeightUnit;
}

/** Highest weight, most reps, and best single-session volume — three quick "best ever" numbers. */
export function PersonalRecordsRow({ personalRecords, unit }: PersonalRecordsRowProps) {
  return (
    <Section title="Personal Records">
      <Row gap="sm" wrap>
        <Column style={{ flex: 1, minWidth: 100 }}>
          <StatCard
            label="Highest Weight"
            value={personalRecords.maxWeight?.value ?? '—'}
            unit={personalRecords.maxWeight?.unit}
          />
        </Column>
        <Column style={{ flex: 1, minWidth: 100 }}>
          <StatCard label="Most Reps" value={personalRecords.maxReps?.value ?? '—'} />
        </Column>
        <Column style={{ flex: 1, minWidth: 100 }}>
          <StatCard label="Highest Volume" value={personalRecords.maxVolume?.value ?? '—'} unit={personalRecords.maxVolume ? unit : undefined} />
        </Column>
      </Row>
    </Section>
  );
}
