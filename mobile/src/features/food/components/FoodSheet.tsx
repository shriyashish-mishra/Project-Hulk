import { Column } from '@/components';
import { Sheet } from '@/components/dialog';
import { useFoodPresets } from '@/features/presets/hooks';
import { useFoodLog } from '../hooks';
import { MEAL_TYPES, MEAL_TYPE_LABELS } from '../types';
import { MealEntryRow } from './MealEntryRow';

export interface FoodSheetProps {
  visible: boolean;
  onClose: () => void;
  date?: string;
}

/** All four meal slots for one day in one place — matches "meal type grouping" rather than four separate flows. */
export function FoodSheet({ visible, onClose, date }: FoodSheetProps) {
  const { mealsByType, loading, saveMeal, deleteMeal } = useFoodLog(date);
  const presets = useFoodPresets();

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
              presets={presets}
            />
          ))}
        </Column>
      )}
    </Sheet>
  );
}
