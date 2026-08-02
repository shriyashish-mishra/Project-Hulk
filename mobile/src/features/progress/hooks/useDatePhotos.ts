import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { media } from '@/core/media';
import { ProgressPhotoService } from '../services';
import type { PhotoViewType, ProgressPhoto } from '../types';

export interface UseDatePhotosResult {
  photos: ProgressPhoto[];
  loading: boolean;
  capturing: boolean;
  captureFromCamera: (viewType: PhotoViewType) => Promise<void>;
  pickFromLibrary: (viewType: PhotoViewType) => Promise<void>;
  deletePhoto: (id: number) => Promise<void>;
  updateViewType: (id: number, viewType: PhotoViewType) => Promise<void>;
}

/** Backs the per-date Photos screen (`/photos/[date]`) — one day's front/side/back slots, matching the web app's separate `/photos?date=` page rather than the all-time recent grid `useProgressPhotos` still powers elsewhere. */
export function useDatePhotos(date: string): UseDatePhotosResult {
  const db = useSQLiteContext();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const refresh = useCallback(() => {
    ProgressPhotoService.getPhotosForDate(db, date).then((result) => {
      setPhotos(result);
      setLoading(false);
    });
  }, [db, date]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFrom = useCallback(
    async (viewType: PhotoViewType, picked: { uri: string } | null) => {
      if (!picked) return;
      setCapturing(true);
      try {
        await ProgressPhotoService.savePhoto(db, date, viewType, picked.uri);
        refresh();
      } finally {
        setCapturing(false);
      }
    },
    [db, date, refresh],
  );

  const captureFromCamera = useCallback(
    async (viewType: PhotoViewType) => {
      const picked = await media.captureFromCamera();
      await addFrom(viewType, picked);
    },
    [addFrom],
  );

  const pickFromLibrary = useCallback(
    async (viewType: PhotoViewType) => {
      const picked = await media.pickFromLibrary();
      await addFrom(viewType, picked);
    },
    [addFrom],
  );

  const deletePhoto = useCallback(
    async (id: number) => {
      await ProgressPhotoService.deletePhoto(db, id);
      refresh();
    },
    [db, refresh],
  );

  const updateViewType = useCallback(
    async (id: number, viewType: PhotoViewType) => {
      await ProgressPhotoService.updateViewType(db, id, viewType);
      refresh();
    },
    [db, refresh],
  );

  return { photos, loading, capturing, captureFromCamera, pickFromLibrary, deletePhoto, updateViewType };
}
