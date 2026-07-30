import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, durations, radius, spacing } from '@/core/theme';
import { haptics } from '@/core/haptics';
import { Body } from '../typography';
import { useToastStore, type ToastVariant } from './toastStore';

const DISPLAY_MS = 2500;

const VARIANT_STYLE: Record<ToastVariant, { background: string; foreground: string }> = {
  default: { background: colors.popover, foreground: colors.foreground },
  success: { background: colors.primary, foreground: colors.primaryForeground },
  error: { background: colors.destructive, foreground: colors.foreground },
};

/**
 * Renders the currently active toast (if any) — mount this exactly once,
 * at the app root (`app/_layout.tsx`), then trigger toasts from anywhere
 * via `toast.show()`/`toast.success()`/`toast.error()` (`toastStore.ts`).
 * Auto-dismisses; a light haptic accompanies `success`/`error` only, not
 * every toast — see the design system's restraint rule on haptics.
 */
export function ToastHost() {
  const { message, variant, hide } = useToastStore();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!message) return;
    if (variant === 'success') haptics.success();
    if (variant === 'error') haptics.error();

    const timeout = setTimeout(hide, DISPLAY_MS);
    return () => clearTimeout(timeout);
  }, [message, variant, hide]);

  if (!message) return null;

  const { background, foreground } = VARIANT_STYLE[variant];

  return (
    <Animated.View
      entering={FadeInDown.duration(durations.base)}
      exiting={FadeOutDown.duration(durations.fast)}
      style={[
        styles.container,
        { bottom: insets.bottom + spacing.lg, backgroundColor: background },
      ]}
      pointerEvents="none"
    >
      <Body weight="semiBold" style={{ color: foreground }} numberOfLines={2}>
        {message}
      </Body>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.base,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
});
