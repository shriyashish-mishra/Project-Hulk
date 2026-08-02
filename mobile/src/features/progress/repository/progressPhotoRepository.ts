import type { SQLiteDatabase } from 'expo-sqlite';

import type { PhotoViewType, ProgressPhoto } from '../types';

interface ProgressPhotoRow {
  id: number;
  captured_on: string;
  view_type: PhotoViewType;
  file_path: string;
  created_at: string;
}

function mapRow(row: ProgressPhotoRow): ProgressPhoto {
  return {
    id: row.id,
    capturedOn: row.captured_on,
    viewType: row.view_type,
    filePath: row.file_path,
    createdAt: row.created_at,
  };
}

/** Most recent photos, newest first, bounded by `limit` — never a full scan of years of photos. */
export async function getRecentPhotos(db: SQLiteDatabase, limit: number): Promise<ProgressPhoto[]> {
  const rows = await db.getAllAsync<ProgressPhotoRow>(
    'SELECT * FROM progress_photos ORDER BY captured_on DESC, id DESC LIMIT ?',
    limit,
  );
  return rows.map(mapRow);
}

/** Every photo captured on one exact date, all view types — backs the Journal dashboard's Photos row for a specific day, distinct from `getRecentPhotos`'s date-agnostic recent-grid view. */
export async function getPhotosForDate(db: SQLiteDatabase, date: string): Promise<ProgressPhoto[]> {
  const rows = await db.getAllAsync<ProgressPhotoRow>(
    'SELECT * FROM progress_photos WHERE captured_on = ? ORDER BY id ASC',
    date,
  );
  return rows.map(mapRow);
}

export async function getPhotoById(db: SQLiteDatabase, id: number): Promise<ProgressPhoto | null> {
  const row = await db.getFirstAsync<ProgressPhotoRow>('SELECT * FROM progress_photos WHERE id = ?', id);
  return row ? mapRow(row) : null;
}

export async function addPhoto(
  db: SQLiteDatabase,
  capturedOn: string,
  viewType: PhotoViewType,
  filePath: string,
): Promise<ProgressPhoto> {
  const result = await db.runAsync(
    'INSERT INTO progress_photos (captured_on, view_type, file_path) VALUES (?, ?, ?)',
    capturedOn,
    viewType,
    filePath,
  );
  const row = await db.getFirstAsync<ProgressPhotoRow>(
    'SELECT * FROM progress_photos WHERE id = ?',
    result.lastInsertRowId,
  );
  if (!row) {
    throw new Error('addPhoto: row missing immediately after insert');
  }
  return mapRow(row);
}

export async function deletePhotoRow(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM progress_photos WHERE id = ?', id);
}

export async function updatePhotoViewType(
  db: SQLiteDatabase,
  id: number,
  viewType: PhotoViewType,
): Promise<ProgressPhoto> {
  await db.runAsync('UPDATE progress_photos SET view_type = ? WHERE id = ?', viewType, id);
  const row = await db.getFirstAsync<ProgressPhotoRow>('SELECT * FROM progress_photos WHERE id = ?', id);
  if (!row) {
    throw new Error('updatePhotoViewType: row missing immediately after update');
  }
  return mapRow(row);
}
