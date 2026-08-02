import { router, useLocalSearchParams } from 'expo-router';

import { Button, Card, Column, Icon, Row, ScrollScreen } from '@/components';
import { Title } from '@/components/typography';
import { formatShortDateWithWeekday, getTodayDateString } from '@/core/utils';
import { PhotoCaptureRow, PhotoGrid } from '@/features/progress/components';
import { useDatePhotos } from '@/features/progress/hooks';

/** One day's progress photos — matches the web app's separate `/photos?date=` page, reached from the Journal dashboard's Photos row rather than embedded inline. */
export default function DatePhotosScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const { photos, capturing, captureFromCamera, pickFromLibrary, deletePhoto, updateViewType } = useDatePhotos(date);
  const isToday = date === getTodayDateString();

  return (
    <ScrollScreen>
      <Row align="center" gap="sm">
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.back()}
          accessibilityLabel="Back"
          leftIcon={<Icon name="chevronLeft" size={22} />}
        />
        <Title style={{ fontSize: 22 }}>
          {isToday ? 'Today' : formatShortDateWithWeekday(date)}
        </Title>
      </Row>

      <Card>
        <PhotoCaptureRow capturing={capturing} onCapture={captureFromCamera} onPickFromLibrary={pickFromLibrary} />
      </Card>

      <Column gap="sm">
        <PhotoGrid photos={photos} onDelete={deletePhoto} onUpdateViewType={updateViewType} />
      </Column>
    </ScrollScreen>
  );
}
