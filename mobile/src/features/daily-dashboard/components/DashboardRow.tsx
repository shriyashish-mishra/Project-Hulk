import { Card, Column, Icon, Row } from '@/components';
import { Body, Caption } from '@/components/typography';
import { colors } from '@/core/theme';

export interface DashboardRowProps {
  label: string;
  /** One-line summary of what's logged, or a placeholder like "Not logged" / "Write about today." */
  preview: string;
  completed: boolean;
  onPress: () => void;
}

/**
 * One row per daily field (Food/Workout/Sleep/Weight/Photos/Cycle/Notes)
 * — label + one-line preview on the left, a mint check or muted plus on
 * the right, the whole row opening that field's `Sheet`. This is the one
 * consistent interaction pattern web uses for every daily field (see
 * `FoodDashboard`/`WorkoutCard`/`SleepRow`/`WeightRow`/`CycleRow` — all a
 * button-row-as-drawer-trigger), applied uniformly here instead of mixing
 * inline cards and sheets the way the old Home screen did.
 */
export function DashboardRow({ label, preview, completed, onPress }: DashboardRowProps) {
  return (
    <Card pressable onPress={onPress} accessibilityLabel={label}>
      <Row justify="space-between" align="center">
        <Column gap="xs" style={{ flex: 1 }}>
          <Body weight="semiBold">{label}</Body>
          <Caption color="mutedForeground" numberOfLines={2}>
            {preview}
          </Caption>
        </Column>
        <Icon name={completed ? 'check' : 'plus'} color={completed ? colors.primary : colors.mutedForeground} />
      </Row>
    </Card>
  );
}
