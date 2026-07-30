import * as Clipboard from 'expo-clipboard';

/**
 * Thin wrapper around `expo-clipboard` — call `clipboard.copy(...)` rather
 * than importing `expo-clipboard` directly, matching `core/haptics`'s
 * pattern of naming the *meaning* of a platform call at the call site.
 */
export const clipboard = {
  copy: (text: string) => Clipboard.setStringAsync(text),
};
