import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { colors, radius, spacing } from '@/core/theme';
import { usePressScale } from '@/core/animation';
import { haptics } from '@/core/haptics';
import { Row } from '../layout/Row';
import { Text } from '../typography/Text';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'base' | 'lg';

const VARIANT_STYLES: Record<
  ButtonVariant,
  { background: string; foreground: string; border?: string }
> = {
  primary: { background: colors.primary, foreground: colors.primaryForeground },
  secondary: { background: colors.card, foreground: colors.foreground, border: colors.border },
  ghost: { background: 'transparent', foreground: colors.foreground },
  destructive: { background: `${colors.destructive}26`, foreground: colors.destructive }, // ~15% opacity, matches the web app's translucent destructive button
};

const SIZE_STYLES: Record<ButtonSize, { height: number; paddingHorizontal: number }> = {
  sm: { height: 36, paddingHorizontal: spacing.base },
  base: { height: 48, paddingHorizontal: spacing.xl },
  lg: { height: 56, paddingHorizontal: spacing['2xl'] },
};

export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  /** Omit for an icon-only button — in that case `accessibilityLabel` is required, since there's no visible text for screen readers to read. */
  children?: ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The app's one button component — every visual variation is a prop, not
 * a separate component (see `ButtonVariant`/`ButtonSize`). Pill-shaped
 * (`radius.full`), matching the web app's `rounded-full` buttons exactly.
 * Icon-only mode is automatic: pass an icon with no `children`.
 */
export function Button({
  variant = 'primary',
  size = 'base',
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  children,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { animatedStyle, handlers } = usePressScale({ disabled: disabled || loading });

  const { background, foreground, border } = VARIANT_STYLES[variant];
  const { height, paddingHorizontal } = SIZE_STYLES[size];
  const isIconOnly = !children;
  const isDisabled = disabled || loading;

  function handlePress(event: GestureResponderEvent) {
    haptics.light();
    onPress?.(event);
  }

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : handlePress}
      {...handlers}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[
        animatedStyle,
        {
          height,
          width: isIconOnly ? height : undefined,
          paddingHorizontal: isIconOnly ? 0 : paddingHorizontal,
          borderRadius: radius.full,
          backgroundColor: background,
          borderWidth: border ? 1 : 0,
          borderColor: border,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: isDisabled && !loading ? 0.4 : 1,
        },
        style,
      ]}
    >
      <Row align="center" justify="center" gap="sm" style={{ flex: 1 }}>
        {loading ? (
          <ActivityIndicator color={foreground} />
        ) : (
          <>
            {leftIcon}
            {children && (
              <Text
                variant="body"
                weight="semiBold"
                style={{ color: foreground }}
                numberOfLines={1}
              >
                {children}
              </Text>
            )}
            {rightIcon}
          </>
        )}
      </Row>
    </AnimatedPressable>
  );
}
