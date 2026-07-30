import { useState } from 'react';

import { Button, Column, Input, NumberInput, TextArea } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { haptics } from '@/core/haptics';
import { useWorkoutLog } from '../hooks';

export interface WorkoutSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Workout entry — type, duration, and a free-text note. Opens straight into whatever was already saved for today, if anything. */
export function WorkoutSheet({ visible, onClose }: WorkoutSheetProps) {
  const { workoutLog, loading, saveWorkout } = useWorkoutLog();
  const [saving, setSaving] = useState(false);
  const [workoutType, setWorkoutType] = useState('');
  const [durationText, setDurationText] = useState('');
  const [notes, setNotes] = useState('');

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
        <Input
          label="Type"
          value={workoutType}
          onChangeText={setWorkoutType}
          placeholder="e.g. Leg Day"
        />
        <NumberInput
          label="Duration (minutes)"
          value={durationText}
          onChangeText={setDurationText}
          placeholder="45"
        />
        <TextArea
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Heavy squats today"
          minHeight={80}
          maxHeight={200}
        />
        <Button onPress={handleSave} loading={saving} fullWidth>
          Save Workout
        </Button>
      </Column>
    </Sheet>
  );
}
