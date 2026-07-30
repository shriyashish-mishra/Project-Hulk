import { Share } from 'react-native';

/**
 * Thin wrapper around React Native's built-in `Share` API — no extra
 * dependency needed. Opens the OS share sheet; if the user's Claude app
 * registers as a text share target, it appears there directly.
 */
export const sharing = {
  share: (message: string) => Share.share({ message }),
};
