import { Body, Button, Caption, Card, Column, Icon, Row } from '@/components';
import { colors } from '@/core/theme';
import type { TemplateExercise } from '../types';

function formatDefaults(exercise: TemplateExercise): string {
  if (exercise.category === 'cardio') {
    const parts: string[] = [];
    if (exercise.defaultDurationMinutes != null) parts.push(`${exercise.defaultDurationMinutes} min`);
    if (exercise.defaultInclinePercent != null) parts.push(`${exercise.defaultInclinePercent}%`);
    if (exercise.defaultSpeedKph != null) parts.push(`${exercise.defaultSpeedKph} kph`);
    return parts.length > 0 ? `Default ${parts.join(' · ')}` : 'No defaults set';
  }

  const setsReps =
    exercise.defaultSets != null && exercise.defaultReps != null
      ? `${exercise.defaultSets} × ${exercise.defaultReps}`
      : null;
  const weight =
    exercise.defaultWeight != null ? `@ ${exercise.defaultWeight} ${exercise.defaultWeightUnit ?? ''}`.trim() : null;
  const parts = [setsReps, weight].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? `Default ${parts.join('  ')}` : 'No defaults set';
}

export interface TemplateExerciseRowProps {
  exercise: TemplateExercise;
  onPressKebab: () => void;
}

/** Screen 2's compact exercise card — icon, name, defaults caption, and a kebab that opens `ExerciseActionsSheet`. */
export function TemplateExerciseRow({ exercise, onPressKebab }: TemplateExerciseRowProps) {
  const isCardio = exercise.category === 'cardio';

  return (
    <Card>
      <Row justify="space-between" align="center">
        <Row gap="sm" align="center" style={{ flex: 1 }}>
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
          <Column gap="xs">
            <Body weight="semiBold">{exercise.exerciseName}</Body>
            <Caption color="mutedForeground">{formatDefaults(exercise)}</Caption>
          </Column>
        </Row>
        <Button
          variant="ghost"
          size="sm"
          onPress={onPressKebab}
          accessibilityLabel={`${exercise.exerciseName} actions`}
          leftIcon={<Icon name="moreVertical" color={colors.mutedForeground} size={18} />}
        />
      </Row>
    </Card>
  );
}
