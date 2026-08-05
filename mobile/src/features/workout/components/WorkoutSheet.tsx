import { useState } from 'react';

import { Body, Button, Caption, Card, Column, Icon, Input, NumberInput, Row, TextArea } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { haptics } from '@/core/haptics';
import { colors } from '@/core/theme';
import type { ExerciseLibraryItem } from '@/features/exercise-library/types';
import { useWorkoutPresets } from '@/features/presets/hooks';
import { PresetPickerSheet } from '@/features/presets/components';
import { parsePresetExercises } from '@/features/presets/utils';
import { ExerciseEntrySheet, ExerciseLibraryPickerSheet } from '@/features/workout-templates/components';
import type { TemplateExerciseInput } from '@/features/workout-templates/types';
import { useWorkoutLog } from '../hooks';
import { formatExerciseBlock } from '../utils';

export interface WorkoutSheetProps {
  visible: boolean;
  onClose: () => void;
  date?: string;
}

const PRESET_PLACEHOLDER =
  'Chest & Shoulders\n\nAround the World\n4kg\n4 x 12\n\nLateral Raises\n4kg\n4 x 12\n\nIncline Bench Press\n15kg\n4 x 10';

const MAX_PRESET_PREVIEW_LINES = 3;

/** Renders a saved workout the same way the app's own generated reports do — name left, detail (weight, sets x reps) muted-right — instead of a raw wall of text. */
function renderWorkoutPresetBody(rawText: string) {
  const lines = parsePresetExercises(rawText);
  const visible = lines.slice(0, MAX_PRESET_PREVIEW_LINES);
  const remaining = lines.length - visible.length;

  return (
    <Column gap="xs">
      {visible.map((line, index) => (
        <Row key={index} justify="space-between" align="baseline" gap="sm">
          <Body numberOfLines={1} style={{ flexShrink: 1 }}>
            {line.name}
          </Body>
          {line.detail && (
            <Caption color="mutedForeground" style={{ flexShrink: 0 }}>
              {line.detail}
            </Caption>
          )}
        </Row>
      ))}
      {remaining > 0 && <Caption color="mutedForeground">{`+${remaining} more`}</Caption>}
    </Column>
  );
}

/** Workout entry — type, duration, and a free-text note, plus the same structured "Add Exercise" (library-picker sets/reps/weight form) and "Saved" (reusable presets) affordances the web app's Journal workout drawer has. */
export function WorkoutSheet({ visible, onClose, date }: WorkoutSheetProps) {
  const { workoutLog, loading, saveWorkout } = useWorkoutLog(date);
  const { presets, create, update, remove } = useWorkoutPresets();
  const [saving, setSaving] = useState(false);
  const [workoutType, setWorkoutType] = useState('');
  const [durationText, setDurationText] = useState('');
  const [notes, setNotes] = useState('');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [presetPickerVisible, setPresetPickerVisible] = useState(false);
  const [enteringExercise, setEnteringExercise] = useState<ExerciseLibraryItem | null>(null);

  // Seed the form from today's saved workout the first time it loads —
  // adjusting state during render rather than in an effect, and only
  // once per load (mirrors the same pattern used in the Journal editor).
  const [hydrated, setHydrated] = useState(false);
  if (!loading && !hydrated) {
    setHydrated(true);
    setWorkoutType(workoutLog?.workoutType ?? '');
    setDurationText(workoutLog?.durationMinutes ? String(workoutLog.durationMinutes) : '');
    setNotes(workoutLog?.notes ?? '');
  }

  function appendToNotes(text: string, separator: string) {
    setNotes((prev) => (prev.trim() ? `${prev}${separator}${text}` : text));
  }

  function handlePickFromLibrary(exercise: ExerciseLibraryItem) {
    setPickerVisible(false);
    setEnteringExercise(exercise);
  }

  async function handleSaveExerciseEntry(input: TemplateExerciseInput) {
    if (!enteringExercise) return;
    appendToNotes(formatExerciseBlock(enteringExercise, input), '\n\n');
  }

  function handlePickPreset(rawText: string) {
    appendToNotes(rawText, '\n');
  }

  async function handleSave() {
    setSaving(true);
    try {
      await saveWorkout({
        workoutType: workoutType.trim() || null,
        durationMinutes: durationText ? Number(durationText) : null,
        notes,
      });
      haptics.success();
      toast.success('Workout logged');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet visible={visible} title="Workout" onClose={onClose}>
      <Column gap="base">
        <Row justify="flex-end" gap="base">
          <Card pressable onPress={() => setPickerVisible(true)} padding="none" style={{ backgroundColor: 'transparent' }}>
            <Row gap="xs" align="center">
              <Icon name="plus" size={13} color={colors.primary} />
              <Caption weight="semiBold" color="primary">
                Add Exercise
              </Caption>
            </Row>
          </Card>
          <Card pressable onPress={() => setPresetPickerVisible(true)} padding="none" style={{ backgroundColor: 'transparent' }}>
            <Row gap="xs" align="center">
              <Icon name="bookmark" size={13} color={colors.primary} />
              <Caption weight="semiBold" color="primary">
                Saved
              </Caption>
            </Row>
          </Card>
        </Row>

        <Input label="Type" value={workoutType} onChangeText={setWorkoutType} placeholder="e.g. Leg Day" />
        <NumberInput label="Duration (minutes)" value={durationText} onChangeText={setDurationText} placeholder="45" />
        <TextArea
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Heavy squats today"
          minHeight={80}
          maxHeight={200}
        />
        <Caption color="mutedForeground">
          Use &ldquo;Add Exercise&rdquo; above for the same sets/reps/weight (or duration/incline for cardio) form
          Templates and Sessions use, or type/paste freely here.
        </Caption>

        <Button onPress={handleSave} loading={saving} fullWidth>
          Save Workout
        </Button>
      </Column>

      <ExerciseLibraryPickerSheet visible={pickerVisible} onClose={() => setPickerVisible(false)} onPick={handlePickFromLibrary} />

      <ExerciseEntrySheet
        visible={enteringExercise !== null}
        onClose={() => setEnteringExercise(null)}
        exercise={enteringExercise}
        onSave={handleSaveExerciseEntry}
      />

      <PresetPickerSheet
        visible={presetPickerVisible}
        onClose={() => setPresetPickerVisible(false)}
        title="Saved workouts"
        emptyLabel="No saved workouts yet. Add the regimes you repeat often."
        addPlaceholder={PRESET_PLACEHOLDER}
        presets={presets}
        onSelect={handlePickPreset}
        onCreate={create}
        onUpdate={update}
        onDelete={remove}
        renderPresetBody={renderWorkoutPresetBody}
      />
    </Sheet>
  );
}
