import * as ImagePicker from 'expo-image-picker';

export interface PickedImage {
  uri: string;
}

async function ensureCameraPermission(): Promise<boolean> {
  const current = await ImagePicker.getCameraPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestCameraPermissionsAsync();
  return requested.granted;
}

async function ensureLibraryPermission(): Promise<boolean> {
  const current = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (current.granted) return true;
  const requested = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return requested.granted;
}

/**
 * Thin wrapper around `expo-image-picker` — handles permission requests
 * internally, so callers only ever see "the user picked an image" or
 * "the user picked nothing" (denied permission and a cancelled picker
 * both just resolve to `null`).
 */
export const media = {
  async captureFromCamera(): Promise<PickedImage | null> {
    const granted = await ensureCameraPermission();
    if (!granted) return null;
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: 'images', quality: 0.7 });
    return result.canceled ? null : { uri: result.assets[0].uri };
  },

  async pickFromLibrary(): Promise<PickedImage | null> {
    const granted = await ensureLibraryPermission();
    if (!granted) return null;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', quality: 0.7 });
    return result.canceled ? null : { uri: result.assets[0].uri };
  },
};
