import { Directory, File, Paths } from 'expo-file-system';

// Constructed lazily, on first actual use — never at module load. Expo
// Router's typed-routes/SSR bootstrap imports every route module just to
// build its manifest, and `expo-file-system`'s Directory/Paths aren't
// available in that (or any web) context. Deferring construction means
// merely importing this module never touches the native filesystem API;
// it's only reached when a photo is actually being saved or deleted,
// which only happens on a real device.
let photosDirectory: Directory | null = null;

function getPhotosDirectory(): Directory {
  if (!photosDirectory) {
    photosDirectory = new Directory(Paths.document, 'progress-photos');
  }
  return photosDirectory;
}

function ensureDirectory(): void {
  const directory = getPhotosDirectory();
  if (!directory.exists) {
    directory.create({ intermediates: true, idempotent: true });
  }
}

/**
 * Copies a picked image out of its (often temporary) picker/camera
 * location into the app's own persistent storage — the database only
 * ever stores a path to a file the app itself owns, never a cache URI
 * the OS is free to reclaim.
 */
export async function persistPhotoFile(sourceUri: string): Promise<string> {
  ensureDirectory();
  const extensionMatch = /\.([a-zA-Z0-9]+)$/.exec(sourceUri);
  const extension = extensionMatch ? extensionMatch[1] : 'jpg';
  const destination = new File(getPhotosDirectory(), `${Date.now()}.${extension}`);
  await new File(sourceUri).copy(destination);
  return destination.uri;
}

export function deletePhotoFile(filePath: string): void {
  const file = new File(filePath);
  if (file.exists) {
    file.delete();
  }
}
