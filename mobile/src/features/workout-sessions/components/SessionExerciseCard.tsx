import { Body, Card, Column, Icon, Label, Row } from '@/components';
import { colors, radius, spacing } from '@/core/theme';
import type { SessionExercise } from '../types';

export interface SessionExerciseCardProps {
  exercise: SessionExercise;
  /** Opens the shared weight/reps (or duration/incline/speed) edit sheet for this exercise. */
  onPressField: () => void;
  onToggleSet: (setIndex: number) => void;
}

function SetDot({ done, onPress }: { done: boolean; onPress: () => void }) {
  return (
    <Card
      pressable
      onPress={onPress}
      padding="none"
      accessibilityLabel={done ? 'Mark set incomplete' : 'Mark set complete'}
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: done ? 0 : 1.5,
        borderColor: colors.border,
        backgroundColor: done ? colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {done && <Icon name="check" size={12} color={colors.primaryForeground} />}
    </Card>
  );
}

function FieldChip({ label, value, suffix }: { label: string; value: number | null; suffix?: string }) {
  return (
    <Column
      gap="xs"
      style={{ flex: 1, backgroundColor: colors.muted, borderRadius: radius.md, padding: spacing.sm }}
    >
      <Label color="mutedForeground" style={{ fontSize: 9.5 }}>
        {label}
      </Label>
      <Body weight="bold" style={{ fontSize: 15 }}>
        {value != null ? `${value}${suffix ?? ''}` : '—'}
      </Body>
    </Column>
  );
}

/** Screen 3's per-exercise card — editable weight/reps (or duration/incline/speed) and tappable set-completion dots. Cardio exercises get a single dot standing in for "done." */
export function SessionExerciseCard({ exercise, onPressField, onToggleSet }: SessionExerciseCardProps) {
  const isCardio = exercise.category === 'cardio';
  const setsPlanned = exercise.setsPlanned ?? 0;
  const isDone = isCardio ? exercise.setsCompleted > 0 : setsPlanned > 0 && exercise.setsCompleted >= setsPlanned;

  return (
    <Card>
      <Column gap="md">
        <Row justify="space-between" align="center">
          <Row gap="sm" align="center">
            <Row
              align="center"
              justify="center"
              style={{
                width: 30,
                height: 30,
                borderRadius: 9,
                backgroundColor: isCardio ? `${colors.warning}24` : `${colors.primary}1f`,
              }}
            >
              <Icon name={isCardio ? 'walk' : 'dumbbell'} color={isCardio ? colors.warning : colors.primary} size={14} />
            </Row>
            <Body weight="semiBold">{exercise.exerciseName}</Body>
          </Row>
          {!isCardio && (
            <Row
              style={{
                backgroundColor: isDone ? `${colors.primary}1f` : colors.muted,
                paddingHorizontal: 9,
                paddingVertical: 3,
                borderRadius: radius.full,
              }}
            >
              <Body weight="bold" style={{ fontSize: 12.5, color: isDone ? colors.primary : colors.mutedForeground }}>
                {exercise.setsCompleted}/{setsPlanned}
              </Body>
            </Row>
          )}
        </Row>

        <Card pressable onPress={onPressField} padding="none" style={{ backgroundColor: 'transparent' }}>
          {isCardio ? (
            <Row gap="sm">
              <FieldChip label="Min" value={exercise.durationMinutes} />
              <FieldChip label="Incline" value={exercise.inclinePercent} suffix="%" />
              <FieldChip label="Kph" value={exercise.speedKph} />
            </Row>
          ) : (
            <Row gap="sm">
              <FieldChip label="Weight" value={exercise.weight} suffix={exercise.weight != null ? ` ${exercise.weightUnit ?? ''}` : ''} />
              <FieldChip label="Reps" value={exercise.reps} />
            </Row>
          )}
        </Card>

        {isCardio ? (
          <Row>
            <SetDot done={exercise.setsCompleted > 0} onPress={() => onToggleSet(0)} />
          </Row>
        ) : (
          setsPlanned > 0 && (
            <Row gap="sm">
              {Array.from({ length: setsPlanned }, (_, index) => (
                <SetDot key={index} done={index < exercise.setsCompleted} onPress={() => onToggleSet(index)} />
              ))}
            </Row>
          )
        )}
      </Column>
    </Card>
  );
}
