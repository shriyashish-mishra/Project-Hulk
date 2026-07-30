import * as Haptics from 'expo-haptics';

/**
 * Thin, semantic wrapper around `expo-haptics` — components should call
 * `haptics.light()` etc. rather than importing `expo-haptics` directly, so
 * the *meaning* of a haptic (not the underlying API) is what's visible at
 * call sites. Used sparingly, on purpose — see the design system's
 * "restraint" rule: a light tap on ordinary presses (Button), a success
 * pulse reserved for genuine completions (save, workout done, streak),
 * nothing else.
 */
export const haptics = {
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
  selection: () => Haptics.selectionAsync(),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
};
