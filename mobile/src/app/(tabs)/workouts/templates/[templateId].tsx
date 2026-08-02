import { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';

import { Body, Button, Caption, Card, Column, Icon, Input, Label, Row, ScrollScreen, Title } from '@/components';
import { colors } from '@/core/theme';
import type { ExerciseLibraryItem } from '@/features/exercise-library/types';
import {
  ExerciseActionsSheet,
  ExerciseEntrySheet,
  ExerciseLibraryPickerSheet,
  TemplateExerciseRow,
} from '@/features/workout-templates/components';
import { useTemplateEditor } from '@/features/workout-templates/hooks';
import type { TemplateExercise, TemplateExerciseInput } from '@/features/workout-templates/types';

/** Screen 2 — Workout Template Editor. */
export default function TemplateEditorScreen() {
  const { templateId: templateIdParam } = useLocalSearchParams<{ templateId: string }>();
  const templateId = Number(templateIdParam);
  const { template, renameTemplate, addExercise, updateExercise, removeExercise, moveExercise } =
    useTemplateEditor(templateId);

  const [name, setName] = useState('');
  const [hydratedName, setHydratedName] = useState(false);
  if (template && !hydratedName) {
    setHydratedName(true);
    setName(template.name);
  }

  const [pickerVisible, setPickerVisible] = useState(false);
  const [entrySheetExercise, setEntrySheetExercise] = useState<ExerciseLibraryItem | null>(null);
  const [editingRow, setEditingRow] = useState<TemplateExercise | null>(null);
  const [actionsRow, setActionsRow] = useState<TemplateExercise | null>(null);

  async function handleSave() {
    await renameTemplate(name);
    router.back();
  }

  function handlePickFromLibrary(exercise: ExerciseLibraryItem) {
    setPickerVisible(false);
    setEditingRow(null);
    setEntrySheetExercise(exercise);
  }

  function handleOpenEdit(row: TemplateExercise) {
    setActionsRow(null);
    setEditingRow(row);
    setEntrySheetExercise({
      id: row.exerciseId,
      name: row.exerciseName,
      category: row.category,
      defaultUnit: row.defaultWeightUnit ?? 'kg',
      createdAt: '',
    });
  }

  function closeEntrySheet() {
    setEntrySheetExercise(null);
    setEditingRow(null);
  }

  async function handleSaveEntry(input: TemplateExerciseInput) {
    if (editingRow) {
      await updateExercise(editingRow.id, input);
    } else if (entrySheetExercise) {
      await addExercise(entrySheetExercise.id, input);
    }
    closeEntrySheet();
  }

  if (!template) {
    return (
      <ScrollScreen>
        <Body color="mutedForeground">Loading…</Body>
      </ScrollScreen>
    );
  }

  const actionsRowIndex = actionsRow ? template.exercises.findIndex((exercise) => exercise.id === actionsRow.id) : -1;

  return (
    <ScrollScreen>
      <Row align="center" gap="sm">
        <Button variant="ghost" size="sm" onPress={() => router.back()} accessibilityLabel="Back" leftIcon={<Icon name="chevronLeft" size={22} />} />
        <Title style={{ fontSize: 22 }}>Edit Template</Title>
      </Row>

      <Input label="Template Name" value={name} onChangeText={setName} placeholder="Pull Day — Upper Body" />

      <Column gap="sm">
        <Row justify="space-between" align="center">
          <Label color="mutedForeground">Template Exercises</Label>
          <Card
            pressable
            onPress={() => setPickerVisible(true)}
            padding="none"
            style={{ backgroundColor: 'transparent' }}
            accessibilityLabel="Add from library"
          >
            <Row gap="xs" align="center">
              <Icon name="plus" color={colors.primary} size={13} />
              <Body weight="semiBold" color="primary" style={{ fontSize: 13 }}>
                Add from library
              </Body>
            </Row>
          </Card>
        </Row>

        {template.exercises.length === 0 ? (
          <Card>
            <Caption color="mutedForeground">No exercises yet — add one from the library.</Caption>
          </Card>
        ) : (
          <Column gap="sm">
            {template.exercises.map((exercise) => (
              <TemplateExerciseRow key={exercise.id} exercise={exercise} onPressKebab={() => setActionsRow(exercise)} />
            ))}
          </Column>
        )}
      </Column>

      <Button
        fullWidth
        onPress={handleSave}
        leftIcon={<Icon name="check" color={colors.primaryForeground} size={16} />}
      >
        Save Template
      </Button>

      <ExerciseLibraryPickerSheet
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onPick={handlePickFromLibrary}
      />

      <ExerciseEntrySheet
        visible={entrySheetExercise !== null}
        onClose={closeEntrySheet}
        exercise={entrySheetExercise}
        initialValues={editingRow}
        onSave={handleSaveEntry}
      />

      {actionsRow && (
        <ExerciseActionsSheet
          visible={actionsRow !== null}
          onClose={() => setActionsRow(null)}
          exerciseName={actionsRow.exerciseName}
          canMoveUp={actionsRowIndex > 0}
          canMoveDown={actionsRowIndex >= 0 && actionsRowIndex < template.exercises.length - 1}
          onEdit={() => handleOpenEdit(actionsRow)}
          onMoveUp={() => moveExercise(actionsRow.id, 'up')}
          onMoveDown={() => moveExercise(actionsRow.id, 'down')}
          onRemove={() => removeExercise(actionsRow.id)}
        />
      )}
    </ScrollScreen>
  );
}
