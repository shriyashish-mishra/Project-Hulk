import { useState } from 'react';
import { Image } from 'expo-image';

import { Button, Column, Row } from '@/components';
import { ConfirmationDialog, Sheet } from '@/components/dialog';
import { Caption } from '@/components/typography';
import { radius } from '@/core/theme';
import { PHOTO_VIEW_TYPES, PHOTO_VIEW_TYPE_LABELS, type PhotoViewType, type ProgressPhoto } from '../types';

export interface PhotoPreviewSheetProps {
  photo: ProgressPhoto | null;
  onClose: () => void;
  onDelete: (id: number) => Promise<void>;
  onUpdateViewType: (id: number, viewType: PhotoViewType) => Promise<void>;
}

function formatDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Full-size preview for a single thumbnail tap — re-tag if it was mislabeled at capture, or delete it (with confirmation, since this can't be undone). */
export function PhotoPreviewSheet({ photo, onClose, onDelete, onUpdateViewType }: PhotoPreviewSheetProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  async function handleConfirmDelete() {
    if (!photo) return;
    await onDelete(photo.id);
    setConfirmingDelete(false);
    onClose();
  }

  return (
    <Sheet visible={photo !== null} title={photo ? PHOTO_VIEW_TYPE_LABELS[photo.viewType] : 'Photo'} onClose={onClose}>
      {photo && (
        <Column gap="base">
          <Image
            source={{ uri: photo.filePath }}
            style={{ width: '100%', aspectRatio: 3 / 4, borderRadius: radius.lg }}
            contentFit="cover"
          />
          <Caption color="mutedForeground">{formatDate(photo.capturedOn)}</Caption>

          <Row gap="sm" wrap>
            {PHOTO_VIEW_TYPES.map((viewType) => (
              <Button
                key={viewType}
                variant={photo.viewType === viewType ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => onUpdateViewType(photo.id, viewType)}
              >
                {PHOTO_VIEW_TYPE_LABELS[viewType]}
              </Button>
            ))}
          </Row>

          <Button variant="destructive" onPress={() => setConfirmingDelete(true)} fullWidth>
            Delete Photo
          </Button>
        </Column>
      )}

      <ConfirmationDialog
        visible={confirmingDelete}
        title="Delete this photo?"
        description="This removes the photo from the app and deletes the file. This can't be undone."
        confirmLabel="Delete"
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmingDelete(false)}
      />
    </Sheet>
  );
}
