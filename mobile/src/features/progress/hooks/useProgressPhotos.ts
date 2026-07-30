import { useCallback, useEffect, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { media } from '@/core/media';
import { getTodayDateString } from '@/core/utils';
import { ProgressPhotoService } from '../services';
import type { PhotoViewType, ProgressPhoto } from '../types';

export interface UseProgressPhotosResult {
  photos: ProgressPhoto[];
  loading: boolean;
  capturing: boolean;
  captureFromCamera: (viewType: PhotoViewType) => Promise<void>;
  pickFromLibrary: (viewType: PhotoViewType) => Promise<void>;
  deletePhoto: (id: number) => Promise<void>;
  updateViewType: (id: number, viewType: PhotoViewType) => Promise<void>;
}

/** Powers the Progress screen's photo section — capture/pick, list, and delete, all in one place. */
export function useProgressPhotos(): UseProgressPhotosResult {
  const db = useSQLiteContext();
  const [photos, setPhotos] = useState<ProgressPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [capturing, setCapturing] = useState(false);

  const refresh = useCallback(() => {
    ProgressPhotoService.getRecentPhotos(db).then((result) => {
      setPhotos(result);
      setLoading(false);
    });
  }, [db]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addFrom = useCallback(
    async (viewType: PhotoViewType, picked: { uri: string } | null) => {
      if (!picked) return;
      setCapturing(true);
      try {
        await ProgressPhotoService.savePhoto(db, getTodayDateString(), viewType, picked.uri);
        refresh();
      } finally {
        setCapturing(false);
      }
    },
    [db, refresh],
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
