import { useState } from 'react';

import { Button, Column, Input, NumberInput, Row } from '@/components';
import { Sheet, toast } from '@/components/dialog';
import { Caption, Label } from '@/components/typography';
import { haptics } from '@/core/haptics';
import { useProfile } from '../hooks';
import {
  ACTIVITY_LEVEL_LABEL,
  PRIMARY_GOAL_LABEL,
  TRAINING_FREQUENCY_LABEL,
  type ActivityLevel,
  type BiologicalSex,
  type PrimaryGoal,
  type TrainingFrequency,
} from '../types';

export interface ProfileSheetProps {
  visible: boolean;
  onClose: () => void;
}

const DATE_FORMAT_ERROR = 'Use YYYY-MM-DD, e.g. 1998-04-12';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * A flat settings form, not a step-by-step wizard — same underlying
 * fields and target math as the web app's onboarding, but every field
 * fills in independently and nothing here gates using the rest of the
 * app. Same hydrate-once-during-render, button-group-for-enums pattern
 * as `SleepSheet`.
 */
export function ProfileSheet({ visible, onClose }: ProfileSheetProps) {
  const { profile, targets, loading, updateProfile } = useProfile();
  const [saving, setSaving] = useState(false);

  const [displayName, setDisplayName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [dateOfBirthError, setDateOfBirthError] = useState<string | null>(null);
  const [biologicalSex, setBiologicalSex] = useState<BiologicalSex | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [targetWeightKg, setTargetWeightKg] = useState('');
  const [primaryGoal, setPrimaryGoal] = useState<PrimaryGoal | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [trainingFrequency, setTrainingFrequency] = useState<TrainingFrequency | null>(null);

  const [hydrated, setHydrated] = useState(false);
  if (!loading && !hydrated && profile) {
    setHydrated(true);
    setDisplayName(profile.displayName ?? '');
    setDateOfBirth(profile.dateOfBirth ?? '');
    setBiologicalSex(profile.biologicalSex);
    setHeightCm(profile.heightCm != null ? String(profile.heightCm) : '');
    setTargetWeightKg(profile.targetWeightKg != null ? String(profile.targetWeightKg) : '');
    setPrimaryGoal(profile.primaryGoal);
    setActivityLevel(profile.activityLevel);
    setTrainingFrequency(profile.trainingFrequency);
  }

  function validate(): boolean {
    const trimmed = dateOfBirth.trim();
    const nextError = trimmed && !DATE_PATTERN.test(trimmed) ? DATE_FORMAT_ERROR : null;
    setDateOfBirthError(nextError);
    return !nextError;
  }

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);
    try {
      await updateProfile({
        displayName: displayName.trim() || null,
        dateOfBirth: dateOfBirth.trim() || null,
        biologicalSex,
        heightCm: heightCm.trim() ? Number(heightCm) : null,
        targetWeightKg: targetWeightKg.trim() ? Number(targetWeightKg) : null,
        primaryGoal,
        activityLevel,
        trainingFrequency,
      });
      haptics.success();
      toast.success('Profile saved');
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet visible={visible} title="Profile & Targets" onClose={onClose}>
      <Column gap="base">
        <Input label="Name" value={displayName} onChangeText={setDisplayName} placeholder="Optional" />

        <Input
          label="Date of birth"
          value={dateOfBirth}
          onChangeText={(text) => {
            setDateOfBirth(text);
            setDateOfBirthError(null);
          }}
          placeholder="1998-04-12"
          error={dateOfBirthError ?? undefined}
        />

        <Column gap="xs">
          <Label color="mutedForeground">Biological sex</Label>
          <Row gap="sm">
            {(['female', 'male'] as const).map((option) => (
              <Button
                key={option}
                variant={biologicalSex === option ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setBiologicalSex(option)}
              >
                {option === 'female' ? 'Female' : 'Male'}
              </Button>
            ))}
          </Row>
        </Column>

        <Row gap="sm">
          <Column style={{ flex: 1 }}>
            <NumberInput
              label="Height (cm)"
              value={heightCm}
              onChangeText={setHeightCm}
              placeholder="175"
              allowDecimal
            />
          </Column>
          <Column style={{ flex: 1 }}>
            <NumberInput
              label="Target weight (kg)"
              value={targetWeightKg}
              onChangeText={setTargetWeightKg}
              placeholder="Optional"
              allowDecimal
            />
          </Column>
        </Row>

        <Column gap="xs">
          <Label color="mutedForeground">Goal</Label>
          <Row gap="sm" wrap>
            {(Object.keys(PRIMARY_GOAL_LABEL) as PrimaryGoal[]).map((option) => (
              <Button
                key={option}
                variant={primaryGoal === option ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setPrimaryGoal(option)}
              >
                {PRIMARY_GOAL_LABEL[option]}
              </Button>
            ))}
          </Row>
        </Column>

        <Column gap="xs">
          <Label color="mutedForeground">Activity level outside training</Label>
          <Row gap="sm" wrap>
            {(Object.keys(ACTIVITY_LEVEL_LABEL) as ActivityLevel[]).map((option) => (
              <Button
                key={option}
                variant={activityLevel === option ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setActivityLevel(option)}
              >
                {ACTIVITY_LEVEL_LABEL[option]}
              </Button>
            ))}
          </Row>
        </Column>

        <Column gap="xs">
          <Label color="mutedForeground">Training frequency</Label>
          <Row gap="sm" wrap>
            {(Object.keys(TRAINING_FREQUENCY_LABEL) as TrainingFrequency[]).map((option) => (
              <Button
                key={option}
                variant={trainingFrequency === option ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setTrainingFrequency(option)}
              >
                {TRAINING_FREQUENCY_LABEL[option]}
              </Button>
            ))}
          </Row>
        </Column>

        {targets?.calorieRangeKcal && (
          <Caption color="mutedForeground">
            Calories {targets.calorieRangeKcal.min}–{targets.calorieRangeKcal.max} · Protein{' '}
            {targets.proteinTargetG}g · Carbs {targets.carbsTargetG}g · Fat {targets.fatTargetG}g · Fibre{' '}
            {targets.fiberTargetG}g
          </Caption>
        )}

        <Button onPress={handleSave} loading={saving} fullWidth>
          Save Profile
        </Button>
      </Column>
    </Sheet>
  );
}
