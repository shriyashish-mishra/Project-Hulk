import { Body, Caption, Card, Column, Icon, Label, Row } from '@/components';
import { colors, radius, spacing } from '@/core/theme';
import type { SessionWeightSuggestion } from '@/features/workout-progress/types';
import type { SessionExercise } from '../types';

export interface SessionExerciseCardProps {
  exercise: SessionExercise;
  /** Opens the shared weight/reps (or duration/incline/speed) edit sheet for this exercise. */
  onPressField: () => void;
  onToggleSet: (setIndex: number) => void;
  /** Renders the field chips and set dots as plain, non-pressable views — the completed-session detail view reuses this card without letting anything be edited. */
  readOnly?: boolean;
  /** Present when this exercise's pre-filled weight is a Hulk-computed bump/ease from last time — surfaces why the number changed, not just that it did. */
  weightSuggestion?: SessionWeightSuggestion;
}

function SetDot({ done, onPress, readOnly = false }: { done: boolean; onPress: () => void; readOnly?: boolean }) {
  return (
    <Card
      pressable={!readOnly}
      onPress={readOnly ? undefined : onPress}
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
export function SessionExerciseCard({
  exercise,
  onPressField,
  onToggleSet,
  readOnly = false,
  weightSuggestion,
}: SessionExerciseCardProps) {
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

        {weightSuggestion && (
          <Row
            align="center"
            gap="xs"
            style={{
              alignSelf: 'flex-start',
              backgroundColor: weightSuggestion.action === 'increase' ? `${colors.primary}26` : `${colors.warning}26`,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: radius.full,
            }}
          >
            <Icon
              name={weightSuggestion.action === 'increase' ? 'arrowUp' : 'arrowDown'}
              size={11}
              color={weightSuggestion.action === 'increase' ? colors.primary : colors.warning}
            />
            <Caption
              weight="semiBold"
              color={weightSuggestion.action === 'increase' ? 'primary' : 'warning'}
              style={{ fontSize: 11 }}
            >
              Hulk suggests {weightSuggestion.action === 'increase' ? 'increasing' : 'decreasing'} weight
            </Caption>
          </Row>
        )}

        <Card pressable={!readOnly} onPress={readOnly ? undefined : onPressField} padding="none" style={{ backgroundColor: 'transparent' }}>
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
            <SetDot done={exercise.setsCompleted > 0} onPress={() => onToggleSet(0)} readOnly={readOnly} />
          </Row>
        ) : (
          setsPlanned > 0 && (
            <Row gap="sm">
              {Array.from({ length: setsPlanned }, (_, index) => (
                <SetDot key={index} done={index < exercise.setsCompleted} onPress={() => onToggleSet(index)} readOnly={readOnly} />
              ))}
            </Row>
          )
        )}
      </Column>
    </Card>
  );
}
