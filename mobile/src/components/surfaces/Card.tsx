import { Pressable, type AccessibilityRole, type GestureResponderEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { usePressScale } from '@/core/animation';
import { haptics } from '@/core/haptics';
import { Skeleton } from '../feedback/Skeleton';
import { Surface, type SurfaceProps } from './Surface';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export interface CardProps extends SurfaceProps {
  /** Makes the whole card tappable, with the app's standard press-scale feedback and a light haptic. */
  pressable?: boolean;
  onPress?: (event: GestureResponderEvent) => void;
  /** Replaces the card's content with a skeleton placeholder, keeping the card's size and padding stable. */
  loading?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

/**
 * The default container throughout the app — a `Surface` that can
 * optionally be pressed. Non-pressable by default; pass `pressable` (with
 * `onPress`) to make it interactive rather than reaching for a different
 * component.
 */
export function Card({
  pressable,
  onPress,
  loading,
  disabled,
  children,
  accessibilityLabel,
  accessibilityHint,
  style,
  ...surfaceProps
}: CardProps) {
  const { animatedStyle, handlers } = usePressScale({ scaleTo: 0.98, disabled: disabled || loading });

  if (!pressable) {
    return (
      <Surface style={style} {...surfaceProps}>
        {loading ? <Skeleton height={48} /> : children}
      </Surface>
    );
  }

  const role: AccessibilityRole = 'button';

  function handlePress(event: GestureResponderEvent) {
    haptics.light();
    onPress?.(event);
  }

  return (
    <AnimatedPressable
      onPress={disabled || loading ? undefined : handlePress}
      {...handlers}
      disabled={disabled || loading}
      accessibilityRole={role}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: disabled || loading }}
      style={animatedStyle}
    >
      <Surface style={[{ opacity: disabled ? 0.5 : 1 }, style]} {...surfaceProps}>
        {loading ? <Skeleton height={48} /> : children}
      </Surface>
    </AnimatedPressable>
  );
}
