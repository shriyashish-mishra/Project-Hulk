import { Column, ScrollScreen, Section } from '@/components';
import { Body, Title } from '@/components/typography';
import { PhotoCaptureRow, PhotoGrid } from '@/features/progress/components';
import { useProgressPhotos } from '@/features/progress/hooks';
import { WeightTrendCard } from '@/features/weight/components';

export default function ProgressScreen() {
  const { photos, capturing, captureFromCamera, pickFromLibrary, deletePhoto, updateViewType } = useProgressPhotos();

  return (
    <ScrollScreen>
      <Column gap="xs">
        <Title>Progress</Title>
        <Body color="mutedForeground">Trends over time, not a single day.</Body>
      </Column>

      <Section title="Weight">
        <WeightTrendCard />
      </Section>

      <Section title="Progress Photos">
        <PhotoCaptureRow capturing={capturing} onCapture={captureFromCamera} onPickFromLibrary={pickFromLibrary} />
        <PhotoGrid photos={photos} onDelete={deletePhoto} onUpdateViewType={updateViewType} />
      </Section>
    </ScrollScreen>
  );
}
