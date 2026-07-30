import { useState } from 'react';
import { Image } from 'expo-image';

import { Card, Column, Row } from '@/components';
import { Caption, Label } from '@/components/typography';
import { radius } from '@/core/theme';
import type { PhotoViewType, ProgressPhoto } from '../types';
import { PhotoPreviewSheet } from './PhotoPreviewSheet';

export interface PhotoGridProps {
  photos: ProgressPhoto[];
  onDelete: (id: number) => Promise<void>;
  onUpdateViewType: (id: number, viewType: PhotoViewType) => Promise<void>;
}

const THUMBNAIL_SIZE = 96;

function formatDateHeading(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/** Groups photos by the date they were captured — the repository already returns them newest-first, so groups form in that same order without a separate sort. */
function groupByDate(photos: ProgressPhoto[]): { date: string; photos: ProgressPhoto[] }[] {
  const groups: { date: string; photos: ProgressPhoto[] }[] = [];
  for (const photo of photos) {
    const lastGroup = groups[groups.length - 1];
    if (lastGroup && lastGroup.date === photo.capturedOn) {
      lastGroup.photos.push(photo);
    } else {
      groups.push({ date: photo.capturedOn, photos: [photo] });
    }
  }
  return groups;
}

/** Most recent day first, thumbnails wrapping within each day — tapping one opens a full-size preview with re-tag and delete actions. */
export function PhotoGrid({ photos, onDelete, onUpdateViewType }: PhotoGridProps) {
  const [selected, setSelected] = useState<ProgressPhoto | null>(null);

  if (photos.length === 0) {
    return <Caption color="mutedForeground">No progress photos yet.</Caption>;
  }

  return (
    <>
      <Column gap="base">
        {groupByDate(photos).map((group) => (
          <Column key={group.date} gap="sm">
            <Label color="mutedForeground">{formatDateHeading(group.date)}</Label>
            <Row gap="sm" wrap>
              {group.photos.map((photo) => (
                <Card
                  key={photo.id}
                  padding="none"
                  pressable
                  onPress={() => setSelected(photo)}
                  accessibilityLabel={`View ${photo.viewType} photo from ${photo.capturedOn}`}
                  style={{ width: THUMBNAIL_SIZE }}
                >
                  <Image
                    source={{ uri: photo.filePath }}
                    style={{ width: THUMBNAIL_SIZE, height: THUMBNAIL_SIZE, borderRadius: radius.lg }}
                    contentFit="cover"
                  />
                </Card>
              ))}
            </Row>
          </Column>
        ))}
      </Column>
      <PhotoPreviewSheet
        photo={selected}
        onClose={() => setSelected(null)}
        onDelete={onDelete}
        onUpdateViewType={onUpdateViewType}
      />
    </>
  );
}
