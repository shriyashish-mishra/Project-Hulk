import { colors, type ColorToken } from '@/core/theme';
import { Button } from '../button/Button';
import { Icon, type IconName } from '../icon/Icon';
import { Column } from '../layout/Column';
import { Body, Subtitle } from '../typography';

export interface StateMessageProps {
  icon?: IconName;
  iconColor?: ColorToken;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

/**
 * Shared shape behind `EmptyState` and `ErrorState` — they're visually and
 * structurally identical (icon, title, description, optional action), so
 * this is the one implementation; the two exported components just fix
 * `icon`/`iconColor` defaults. Not exported from the package index —
 * use `EmptyState`/`ErrorState` instead.
 */
export function StateMessage({
  icon,
  iconColor = 'mutedForeground',
  title,
  description,
  actionLabel,
  onAction,
}: StateMessageProps) {
  return (
    <Column align="center" justify="center" gap="base" style={{ padding: 32 }}>
      {icon && <Icon name={icon} size={40} color={colors[iconColor]} />}
      <Column align="center" gap="xs">
        <Subtitle align="center">{title}</Subtitle>
        {description && (
          <Body color="mutedForeground" align="center">
            {description}
          </Body>
        )}
      </Column>
      {actionLabel && onAction && (
        <Button variant="secondary" onPress={onAction}>
          {actionLabel}
        </Button>
      )}
    </Column>
  );
}
