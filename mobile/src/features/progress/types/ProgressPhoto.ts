export type PhotoViewType = 'front' | 'side' | 'back';

export const PHOTO_VIEW_TYPES: PhotoViewType[] = ['front', 'side', 'back'];

export const PHOTO_VIEW_TYPE_LABELS: Record<PhotoViewType, string> = {
  front: 'Front',
  side: 'Side',
  back: 'Back',
};

/** `filePath` always points at a file the app copied into its own persistent storage — never the original camera/picker URI, which the OS is free to clean up. */
export interface ProgressPhoto {
  id: number;
  capturedOn: string;
  viewType: PhotoViewType;
  filePath: string;
  createdAt: string;
}
