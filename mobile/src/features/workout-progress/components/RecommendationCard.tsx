import { Card, Column, Row } from '@/components';
import { Body, Caption, Label, Subtitle } from '@/components/typography';
import { colors } from '@/core/theme';
import type { WeightUnit } from '@/features/exercise-library/types';
import type { RecommendationConfidence, WeightRecommendation } from '../types';

export interface RecommendationCardProps {
  recommendation: WeightRecommendation;
  unit: WeightUnit;
}

const CONFIDENCE_LABEL: Record<RecommendationConfidence, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

/** The next-weight call — same number the chart's projected point shows, plus the reasoning and how sure the app is. */
export function RecommendationCard({ recommendation, unit }: RecommendationCardProps) {
  const headline =
    recommendation.action === 'increase' && recommendation.nextWeight !== null
      ? `Increase to ${recommendation.nextWeight}${unit} next session`
      : recommendation.nextWeight !== null
        ? `Stay at ${recommendation.nextWeight}${unit}`
        : 'Not enough data yet';

  return (
    <Card>
      <Column gap="sm">
        <Label color="mutedForeground">Next Weight Recommendation</Label>
        <Subtitle color={recommendation.action === 'increase' ? 'primary' : 'foreground'}>{headline}</Subtitle>
        <Row justify="space-between" align="center">
          <Body color="mutedForeground">{recommendation.reason}</Body>
          <Row
            style={{
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 999,
              backgroundColor: colors.muted,
            }}
          >
            <Caption color="mutedForeground">{CONFIDENCE_LABEL[recommendation.confidence]} confidence</Caption>
          </Row>
        </Row>
      </Column>
    </Card>
  );
}
