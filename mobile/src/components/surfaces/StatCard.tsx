import type { ReactNode } from 'react';

import { Row } from '../layout/Row';
import { Column } from '../layout/Column';
import { Caption, Heading } from '../typography';
import { Card, type CardProps } from './Card';

export interface StatCardProps extends Omit<CardProps, 'children'> {
  label: string;
  value: string | number;
  unit?: string;
  /** Rendered at the trailing edge — typically an `Icon`. */
  icon?: ReactNode;
}

/** A labeled number in a `Card` — the app's standard "stat tile" (e.g. calories, glasses of water, streak days). */
export function StatCard({ label, value, unit, icon, ...cardProps }: StatCardProps) {
  return (
    <Card {...cardProps}>
      <Row justify="space-between" align="center">
        <Column gap="xs">
          <Caption color="mutedForeground">{label}</Caption>
          <Row align="baseline" gap="xs">
            <Heading>{value}</Heading>
            {unit && <Caption color="mutedForeground">{unit}</Caption>}
          </Row>
        </Column>
        {icon}
      </Row>
    </Card>
  );
}
