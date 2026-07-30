import { useState } from 'react';

import { Button, Column, Icon, NumberInput, Row, TextArea } from '@/components';
import { Sheet } from '@/components/dialog';
import { colors, spacing } from '@/core/theme';
import type { ExerciseLibraryItem, WeightUnit } from '@/features/exercise-library/types';
import type { TemplateExerciseInput } from '../types';

export interface ExerciseEntrySheetProps {
  visible: boolean;
  onClose: () => void;
  /** The exercise this entry is for — name/category/defaultUnit drive which fields render. Sheet renders nothing while this is null. */
  exercise: ExerciseLibraryItem | null;
  /** Present when editing an existing template row's defaults; omitted when adding a new one. */
  initialValues?: TemplateExerciseInput | null;
  onSave: (input: TemplateExerciseInput) => Promise<void>;
}

function UnitToggle({ unit, onChange }: { unit: WeightUnit; onChange: (unit: WeightUnit) => void }) {
  return (
    <Row gap="xs">
      {(['kg', 'lbs'] as const).map((option) => (
        <Button key={option} variant={unit === option ? 'primary' : 'secondary'} size="sm" onPress={() => onChange(option)}>
          {option}
        </Button>
      ))}
    </Row>
  );
}

/**
 * Screen 1 — sets/reps/weight/rest/notes for a strength exercise, or
 * duration/incline/speed/notes for cardio. Shared between "+ Add from
 * library" (create) and a row's kebab "Edit defaults" (edit), keyed off
 * whether `initialValues` is present.
 */
export function ExerciseEntrySheet({ visible, onClose, exercise, initialValues, onSave }: ExerciseEntrySheetProps) {
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [rest, setRest] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [inclinePercent, setInclinePercent] = useState('');
  const [speedKph, setSpeedKph] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Re-seed every time the sheet opens (not just once ever) — this same
  // instance is reused for every exercise on the template, so a plain
  // `useEffect` keyed on `visible` would fire *after* the first paint and
  // flash stale values; adjusting state during render, the same pattern
  // `WorkoutSheet` uses, seeds before anything is shown.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible && !wasVisible && exercise) {
    setWasVisible(true);
    setSets(initialValues?.defaultSets != null ? String(initialValues.defaultSets) : '');
    setReps(initialValues?.defaultReps != null ? String(initialValues.defaultReps) : '');
    setWeight(initialValues?.defaultWeight != null ? String(initialValues.defaultWeight) : '');
    setUnit(initialValues?.defaultWeightUnit ?? exercise.defaultUnit);
    setRest(initialValues?.defaultRestSeconds != null ? String(initialValues.defaultRestSeconds) : '');
    setDurationMinutes(initialValues?.defaultDurationMinutes != null ? String(initialValues.defaultDurationMinutes) : '');
    setInclinePercent(initialValues?.defaultInclinePercent != null ? String(initialValues.defaultInclinePercent) : '');
    setSpeedKph(initialValues?.defaultSpeedKph != null ? String(initialValues.defaultSpeedKph) : '');
    setNotes(initialValues?.notes ?? '');
  }
  if (!visible && wasVisible) {
    setWasVisible(false);
  }

  if (!exercise) return null;
  const isCardio = exercise.category === 'cardio';

  async function handleSave() {
    setSaving(true);
    try {
      await onSave({
        defaultSets: isCardio ? null : sets ? Number(sets) : null,
        defaultReps: isCardio ? null : reps ? Number(reps) : null,
        defaultWeight: isCardio ? null : weight ? Number(weight) : null,
        defaultWeightUnit: isCardio ? null : weight ? unit : null,
        defaultRestSeconds: isCardio ? null : rest ? Number(rest) : null,
        defaultDurationMinutes: isCardio ? (durationMinutes ? Number(durationMinutes) : null) : null,
        defaultInclinePercent: isCardio ? (inclinePercent ? Number(inclinePercent) : null) : null,
        defaultSpeedKph: isCardio ? (speedKph ? Number(speedKph) : null) : null,
        notes: notes.trim() || null,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet visible={visible} title={exercise.name} onClose={onClose}>
      <Column gap="base">
        {isCardio ? (
          <Row gap="sm">
            <Column style={{ flex: 1 }}>
              <NumberInput label="Minutes" value={durationMinutes} onChangeText={setDurationMinutes} placeholder="30" />
            </Column>
            <Column style={{ flex: 1 }}>
              <NumberInput label="Incline %" value={inclinePercent} onChangeText={setInclinePercent} placeholder="15" allowDecimal />
            </Column>
            <Column style={{ flex: 1 }}>
              <NumberInput label="Speed (kph)" value={speedKph} onChangeText={setSpeedKph} placeholder="3.0" allowDecimal />
            </Column>
          </Row>
        ) : (
          <>
            <Row gap="sm">
              <Column style={{ flex: 1 }}>
                <NumberInput label="Sets" value={sets} onChangeText={setSets} placeholder="4" />
              </Column>
              <Column style={{ flex: 1 }}>
                <NumberInput label="Reps" value={reps} onChangeText={setReps} placeholder="20" />
              </Column>
            </Row>
            <Row gap="sm" align="flex-end">
              <Column style={{ flex: 1 }}>
                <NumberInput label="Weight" value={weight} onChangeText={setWeight} placeholder="7.5" allowDecimal />
              </Column>
              <Column style={{ paddingBottom: spacing.xs }}>
                <UnitToggle unit={unit} onChange={setUnit} />
              </Column>
            </Row>
            <NumberInput label="Rest (sec)" value={rest} onChangeText={setRest} placeholder="60" />
          </>
        )}

        <TextArea
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder={isCardio ? 'Flat pace, steady state' : 'Alternating dumbbells, controlled eccentric'}
          minHeight={60}
          maxHeight={140}
        />

        <Button
          onPress={handleSave}
          loading={saving}
          fullWidth
          leftIcon={<Icon name="check" color={colors.primaryForeground} size={16} />}
        >
          Save Exercise
        </Button>
      </Column>
    </Sheet>
  );
}
