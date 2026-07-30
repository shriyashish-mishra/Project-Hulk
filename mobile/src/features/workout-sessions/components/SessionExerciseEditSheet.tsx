import { useState } from 'react';

import { Button, Column, Icon, NumberInput, Row } from '@/components';
import { Sheet } from '@/components/dialog';
import { colors, spacing } from '@/core/theme';
import type { WeightUnit } from '@/features/exercise-library/types';
import type { SessionExercise, SessionExerciseUpdate } from '../types';

export interface SessionExerciseEditSheetProps {
  visible: boolean;
  onClose: () => void;
  exercise: SessionExercise | null;
  onSave: (updates: SessionExerciseUpdate) => Promise<void>;
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

/** Screen 3's lightweight live edit — weight+reps for strength, duration/incline/speed for cardio. Deliberately smaller than `ExerciseEntrySheet`: no sets/rest here, since sets are tracked via the dots and rest isn't edited mid-session. */
export function SessionExerciseEditSheet({ visible, onClose, exercise, onSave }: SessionExerciseEditSheetProps) {
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [reps, setReps] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [inclinePercent, setInclinePercent] = useState('');
  const [speedKph, setSpeedKph] = useState('');
  const [saving, setSaving] = useState(false);

  // Adjust state during render (not in a `useEffect`) so a re-open always
  // shows the exercise's current values before the first paint — matches
  // `ExerciseEntrySheet`'s hydration pattern for the same reason.
  const [wasVisible, setWasVisible] = useState(false);
  if (visible && !wasVisible && exercise) {
    setWasVisible(true);
    setWeight(exercise.weight != null ? String(exercise.weight) : '');
    setUnit(exercise.weightUnit ?? 'kg');
    setReps(exercise.reps != null ? String(exercise.reps) : '');
    setDurationMinutes(exercise.durationMinutes != null ? String(exercise.durationMinutes) : '');
    setInclinePercent(exercise.inclinePercent != null ? String(exercise.inclinePercent) : '');
    setSpeedKph(exercise.speedKph != null ? String(exercise.speedKph) : '');
  }
  if (!visible && wasVisible) {
    setWasVisible(false);
  }

  if (!exercise) return null;
  const isCardio = exercise.category === 'cardio';

  async function handleSave() {
    setSaving(true);
    try {
      if (isCardio) {
        await onSave({
          durationMinutes: durationMinutes ? Number(durationMinutes) : null,
          inclinePercent: inclinePercent ? Number(inclinePercent) : null,
          speedKph: speedKph ? Number(speedKph) : null,
        });
      } else {
        await onSave({
          weight: weight ? Number(weight) : null,
          weightUnit: weight ? unit : null,
          reps: reps ? Number(reps) : null,
        });
      }
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet visible={visible} title={exercise.exerciseName} onClose={onClose}>
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
          <Row gap="sm" align="flex-end">
            <Column style={{ flex: 1 }}>
              <NumberInput label="Weight" value={weight} onChangeText={setWeight} placeholder="7.5" allowDecimal />
            </Column>
            <Column style={{ paddingBottom: spacing.xs }}>
              <UnitToggle unit={unit} onChange={setUnit} />
            </Column>
            <Column style={{ flex: 1 }}>
              <NumberInput label="Reps" value={reps} onChangeText={setReps} placeholder="20" />
            </Column>
          </Row>
        )}

        <Button
          onPress={handleSave}
          loading={saving}
          fullWidth
          leftIcon={<Icon name="check" color={colors.primaryForeground} size={16} />}
        >
          Save
        </Button>
      </Column>
    </Sheet>
  );
}
