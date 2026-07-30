import { Button, Column, Icon } from '@/components';
import { Sheet } from '@/components/dialog';
import { colors } from '@/core/theme';

export interface ExerciseActionsSheetProps {
  visible: boolean;
  onClose: () => void;
  exerciseName: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onEdit: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRemove: () => void;
}

/**
 * The kebab menu's contents — reorder as "Move up / Move down" rather than
 * drag handles, since `react-native-draggable-flatlist` isn't a dependency
 * this app has yet and this ships a fully working reorder without adding
 * one.
 */
export function ExerciseActionsSheet({
  visible,
  onClose,
  exerciseName,
  canMoveUp,
  canMoveDown,
  onEdit,
  onMoveUp,
  onMoveDown,
  onRemove,
}: ExerciseActionsSheetProps) {
  function run(action: () => void) {
    onClose();
    action();
  }

  return (
    <Sheet visible={visible} title={exerciseName} onClose={onClose}>
      <Column gap="sm">
        <Button
          variant="secondary"
          fullWidth
          leftIcon={<Icon name="edit" color={colors.foreground} size={16} />}
          onPress={() => run(onEdit)}
        >
          Edit defaults
        </Button>
        <Button
          variant="secondary"
          fullWidth
          disabled={!canMoveUp}
          leftIcon={<Icon name="arrowUp" color={colors.foreground} size={16} />}
          onPress={() => run(onMoveUp)}
        >
          Move up
        </Button>
        <Button
          variant="secondary"
          fullWidth
          disabled={!canMoveDown}
          leftIcon={<Icon name="arrowDown" color={colors.foreground} size={16} />}
          onPress={() => run(onMoveDown)}
        >
          Move down
        </Button>
        <Button
          variant="destructive"
          fullWidth
          leftIcon={<Icon name="trash" color={colors.destructive} size={16} />}
          onPress={() => run(onRemove)}
        >
          Remove
        </Button>
      </Column>
    </Sheet>
  );
}
