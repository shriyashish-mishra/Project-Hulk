// eslint-disable-next-line no-restricted-imports -- a horizontal chip strip has no design-system equivalent yet; scoped to this one usage
import { ScrollView } from 'react-native';

import { Card } from '@/components';
import { Body } from '@/components/typography';
import { colors } from '@/core/theme';
import type { RecentExercise } from '../types';

export interface ExercisePickerStripProps {
  exercises: RecentExercise[];
  selectedExerciseId: number | null;
  onSelect: (exerciseId: number) => void;
}

/** Horizontal chip strip — every strength exercise ever completed, most recently trained first, selected one bordered mint. */
export function ExercisePickerStrip({ exercises, selectedExerciseId, onSelect }: ExercisePickerStripProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
      {exercises.map((exercise) => {
        const selected = exercise.exerciseId === selectedExerciseId;
        return (
          <Card
            key={exercise.exerciseId}
            pressable
            onPress={() => onSelect(exercise.exerciseId)}
            accessibilityLabel={exercise.name}
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderWidth: 1,
              borderColor: selected ? colors.primary : 'transparent',
            }}
          >
            <Body weight="semiBold" color={selected ? 'primary' : 'foreground'} numberOfLines={1}>
              {exercise.name}
            </Body>
          </Card>
        );
      })}
    </ScrollView>
  );
}
