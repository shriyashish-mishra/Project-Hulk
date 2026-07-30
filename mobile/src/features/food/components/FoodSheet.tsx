import { Column } from '@/components';
import { Sheet } from '@/components/dialog';
import { useFoodLog } from '../hooks';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../types';
import { MealEntryRow } from './MealEntryRow';

export interface FoodSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** All four meal slots for today in one place — matches "meal type grouping" rather than four separate flows. */
export function FoodSheet({ visible, onClose }: FoodSheetProps) {
  const { mealsByType, loading, saveMeal, deleteMeal } = useFoodLog();

  return (
    <Sheet visible={visible} title="Food" onClose={onClose}>
      {!loading && mealsByType && (
        <Column gap="base">
          {MEAL_TYPES.map((type) => (
            <MealEntryRow
              key={type}
              mealType={type}
              label={MEAL_TYPE_LABELS[type]}
              entry={mealsByType[type]}
              onSave={saveMeal}
              onDelete={deleteMeal}
            />
          ))}
        </Column>
      )}
    </Sheet>
  );
}
