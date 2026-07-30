import { Button, Column, Icon, Row } from '@/components';
import { Label } from '@/components/typography';
import { PHOTO_VIEW_TYPES, PHOTO_VIEW_TYPE_LABELS, type PhotoViewType } from '../types';

export interface PhotoCaptureRowProps {
  capturing: boolean;
  onCapture: (viewType: PhotoViewType) => void;
  onPickFromLibrary: (viewType: PhotoViewType) => void;
}

/** One row per angle (front/side/back) — camera is the primary action, library is the quiet secondary one. */
export function PhotoCaptureRow({ capturing, onCapture, onPickFromLibrary }: PhotoCaptureRowProps) {
  return (
    <Column gap="base">
      {PHOTO_VIEW_TYPES.map((viewType) => (
        <Row key={viewType} justify="space-between" align="center">
          <Label color="mutedForeground">{PHOTO_VIEW_TYPE_LABELS[viewType]}</Label>
          <Row gap="sm">
            <Button
              variant="secondary"
              size="sm"
              onPress={() => onCapture(viewType)}
              disabled={capturing}
              accessibilityLabel={`Take a ${PHOTO_VIEW_TYPE_LABELS[viewType]} photo`}
              leftIcon={<Icon name="camera" size={16} />}
            >
              Camera
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onPickFromLibrary(viewType)}
              disabled={capturing}
              accessibilityLabel={`Choose a ${PHOTO_VIEW_TYPE_LABELS[viewType]} photo from library`}
              leftIcon={<Icon name="image" size={16} />}
            />
          </Row>
        </Row>
      ))}
    </Column>
  );
}
