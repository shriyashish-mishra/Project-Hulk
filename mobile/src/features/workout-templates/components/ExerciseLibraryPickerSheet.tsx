import { useMemo, useState } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

import { Body, Button, Card, Caption, Column, Icon, Row, SearchInput } from '@/components';
import { Sheet } from '@/components/dialog';
import { colors } from '@/core/theme';
import { useExerciseLibrary } from '@/features/exercise-library/hooks';
import { ExerciseLibraryService } from '@/features/exercise-library/services';
import type { ExerciseCategory, ExerciseLibraryItem } from '@/features/exercise-library/types';

export interface ExerciseLibraryPickerSheetProps {
  visible: boolean;
  onClose: () => void;
  onPick: (exercise: ExerciseLibraryItem) => void;
}

/** Screen 2's "+ Add from library" — search the existing catalog, or create a new entry on the fly when nothing matches, same "the catalog grows as you type" principle as the entry service. */
export function ExerciseLibraryPickerSheet({ visible, onClose, onPick }: ExerciseLibraryPickerSheetProps) {
  const db = useSQLiteContext();
  const { exercises, refresh } = useExerciseLibrary();
  const [query, setQuery] = useState('');
  const [newCategory, setNewCategory] = useState<ExerciseCategory>('strength');
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return exercises;
    return exercises.filter((item) => item.name.toLowerCase().includes(trimmed));
  }, [exercises, query]);

  const trimmedQuery = query.trim();
  const hasExactMatch = exercises.some((item) => item.name.toLowerCase() === trimmedQuery.toLowerCase());
  const canCreate = trimmedQuery.length > 0 && !hasExactMatch;

  function handlePick(exercise: ExerciseLibraryItem) {
    setQuery('');
    onPick(exercise);
  }

  async function handleCreate() {
    setCreating(true);
    try {
      const created = await ExerciseLibraryService.findOrCreate(db, trimmedQuery, newCategory, 'kg');
      refresh();
      setQuery('');
      onPick(created);
    } finally {
      setCreating(false);
    }
  }

  return (
    <Sheet visible={visible} title="Add from Library" onClose={onClose}>
      <Column gap="base">
        <SearchInput value={query} onChangeText={setQuery} onClear={() => setQuery('')} placeholder="Search exercises" />

        <Column gap="sm">
          {filtered.map((item) => (
            <Card key={item.id} pressable onPress={() => handlePick(item)}>
              <Row justify="space-between" align="center">
                <Row gap="sm" align="center">
                  <Icon name={item.category === 'cardio' ? 'walk' : 'dumbbell'} color={colors.primary} size={16} />
                  <Body weight="semiBold">{item.name}</Body>
                </Row>
                <Icon name="plus" color={colors.mutedForeground} size={16} />
              </Row>
            </Card>
          ))}
        </Column>

        {canCreate && (
          <Column gap="sm" style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16 }}>
            <Caption color="mutedForeground">Not in your library yet</Caption>
            <Row gap="xs">
              {(['strength', 'cardio'] as const).map((option) => (
                <Button
                  key={option}
                  variant={newCategory === option ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => setNewCategory(option)}
                >
                  {option === 'strength' ? 'Strength' : 'Cardio'}
                </Button>
              ))}
            </Row>
            <Button
              onPress={handleCreate}
              loading={creating}
              fullWidth
              leftIcon={<Icon name="plus" color={colors.primaryForeground} size={16} />}
            >
              {`Create "${trimmedQuery}"`}
            </Button>
          </Column>
        )}
      </Column>
    </Sheet>
  );
}
