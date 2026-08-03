import { Card, Column } from '@/components';
import { Body, Label } from '@/components/typography';

export interface InsightBannerProps {
  insight: string;
}

/** A natural-language summary computed from this exercise's own session history — see `computeInsight` in the service layer for how it's built. */
export function InsightBanner({ insight }: InsightBannerProps) {
  return (
    <Card>
      <Column gap="xs">
        <Label color="mutedForeground">Insight</Label>
        <Body>{insight}</Body>
      </Column>
    </Card>
  );
}
