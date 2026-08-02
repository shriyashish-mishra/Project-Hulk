import type { SQLiteDatabase } from 'expo-sqlite';

import { addPhoto, deletePhotoRow, getPhotoById, getPhotosForDate, getRecentPhotos, updatePhotoViewType } from '../repository';
import type { PhotoViewType, ProgressPhoto } from '../types';
import { deletePhotoFile, persistPhotoFile } from './photoStorage';

const RECENT_PHOTOS_LIMIT = 60;

/** Progress photos' business logic — the only place that knows a photo means both a database row and a file on disk, so the two never get out of sync. */
export const ProgressPhotoService = {
  async getRecentPhotos(db: SQLiteDatabase): Promise<ProgressPhoto[]> {
    return getRecentPhotos(db, RECENT_PHOTOS_LIMIT);
  },

  async getPhotosForDate(db: SQLiteDatabase, date: string): Promise<ProgressPhoto[]> {
    return getPhotosForDate(db, date);
  },

  async savePhoto(db: SQLiteDatabase, date: string, viewType: PhotoViewType, sourceUri: string): Promise<ProgressPhoto> {
    const filePath = await persistPhotoFile(sourceUri);
    return addPhoto(db, date, viewType, filePath);
  },

  async deletePhoto(db: SQLiteDatabase, id: number): Promise<void> {
    const photo = await getPhotoById(db, id);
    if (photo) {
      deletePhotoFile(photo.filePath);
    }
    await deletePhotoRow(db, id);
  },

  /** Re-tags a mis-labeled photo (e.g. "Front" tapped by mistake for a side photo) — no file move needed, only the row changes. */
  async updateViewType(db: SQLiteDatabase, id: number, viewType: PhotoViewType): Promise<ProgressPhoto> {
    return updatePhotoViewType(db, id, viewType);
  },
};
