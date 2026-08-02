import { useState } from 'react';
import { router } from 'expo-router';

import { Button, Column, Icon, Row, ScrollScreen } from '@/components';
import { DateNavHeader } from '@/components/navigation';
import { Title } from '@/components/typography';
import { addDays, formatShortDate, formatShortDateWithWeekday, getTodayDateString } from '@/core/utils';
import { CycleSheet } from '@/features/cycle/components';
import { useCycleLog, useCycleSettings } from '@/features/cycle/hooks';
import { FoodSheet } from '@/features/food/components';
import { useTodayFoodLogs } from '@/features/food/hooks';
import { MEAL_TYPES } from '@/features/food/types';
import { NotesSheet } from '@/features/journal/components';
import { useTodayJournalStatus } from '@/features/journal/hooks';
import { usePhotoCountForDate } from '@/features/progress/hooks';
import { SleepSheet } from '@/features/sleep/components';
import { useSleepLog } from '@/features/sleep/hooks';
import { formatDuration } from '@/features/sleep/utils';
import { WaterQuickActionCard } from '@/features/water/components';
import { WeightSheet } from '@/features/weight/components';
import { useWeightLog } from '@/features/weight/hooks';
import { WorkoutSheet } from '@/features/workout/components';
import { useWorkoutLog } from '@/features/workout/hooks';
import { AIReportCard, DashboardRow } from './components';

export interface DailyDashboardScreenProps {
  date: string;
}

type ActiveSheet = 'food' | 'workout' | 'sleep' | 'weight' | 'cycle' | 'notes' | null;

function headerLabel(date: string): string {
  const isToday = date === getTodayDateString();
  return isToday ? `Today, ${formatShortDate(date)}` : formatShortDateWithWeekday(date);
}

/**
 * The unified daily dashboard — one row per field, each a one-line
 * preview that opens that field's `Sheet`, matching web's `/` (today) and
 * `/log/[date]` (backfill) split on a single shared component. Reused by
 * both `(tabs)/journal/index.tsx` and `(tabs)/journal/[date].tsx`, which
 * differ only in how `date` is supplied and how prev/next navigate.
 */
export function DailyDashboardScreen({ date }: DailyDashboardScreenProps) {
  const [activeSheet, setActiveSheet] = useState<ActiveSheet>(null);
  const isToday = date === getTodayDateString();

  const { enabled: cycleEnabled } = useCycleSettings();

  const { foodLogs, refresh: refreshFoodLogs } = useTodayFoodLogs(date);
  const { workoutLog, refresh: refreshWorkoutLog } = useWorkoutLog(date);
  const { sleepLog, refresh: refreshSleepLog } = useSleepLog(date);
  const { weightLog, refresh: refreshWeightLog } = useWeightLog(date);
  const { count: photoCount } = usePhotoCountForDate(date);
  const { activeLog: activeCycleLog } = useCycleLog();
  const { hasEntry: hasNotesEntry, preview: notesPreview } = useTodayJournalStatus(date);

  function closeSheet() {
    setActiveSheet(null);
    refreshFoodLogs();
    refreshWorkoutLog();
    refreshSleepLog();
    refreshWeightLog();
  }

  function goToDate(nextDate: string) {
    if (nextDate === getTodayDateString()) {
      router.replace('/journal');
    } else {
      router.replace(`/journal/${nextDate}`);
    }
  }

  return (
    <ScrollScreen>
      <Row justify="space-between" align="center">
        <Title>Journal</Title>
        <Button
          variant="ghost"
          size="sm"
          onPress={() => router.push('/settings')}
          accessibilityLabel="Settings"
          leftIcon={<Icon name="settings" size={22} />}
        />
      </Row>

      <DateNavHeader
        label={headerLabel(date)}
        onPrev={() => goToDate(addDays(date, -1))}
        onNext={() => goToDate(addDays(date, 1))}
        nextDisabled={isToday}
        jumpDateValue={date}
        onJumpToDate={goToDate}
      />

      <Column gap="sm">
        <DashboardRow
          label="Food"
          preview={foodLogs.length > 0 ? `${foodLogs.length}/${MEAL_TYPES.length} meals logged` : 'Not logged'}
          completed={foodLogs.length > 0}
          onPress={() => setActiveSheet('food')}
        />
        <DashboardRow
          label="Workout"
          preview={workoutLog ? workoutLog.workoutType || 'Workout logged' : 'Not logged'}
          completed={workoutLog !== null}
          onPress={() => setActiveSheet('workout')}
        />
        <WaterQuickActionCard date={date} />
        <DashboardRow
          label="Sleep"
          preview={sleepLog?.durationMinutes != null ? formatDuration(sleepLog.durationMinutes) : 'Not logged'}
          completed={sleepLog !== null}
          onPress={() => setActiveSheet('sleep')}
        />
        <DashboardRow
          label="Weight"
          preview={weightLog ? `${weightLog.weightKg} kg` : 'Not logged'}
          completed={weightLog !== null}
          onPress={() => setActiveSheet('weight')}
        />
        <DashboardRow
          label="Photos"
          preview={photoCount > 0 ? `${photoCount} photo${photoCount === 1 ? '' : 's'}` : 'Not logged'}
          completed={photoCount > 0}
          onPress={() => router.push(`/photos/${date}`)}
        />
        {cycleEnabled && (
          <DashboardRow
            label="Cycle"
            preview={activeCycleLog ? `Period started ${formatShortDate(activeCycleLog.startDate)}` : 'Not tracking today'}
            completed={activeCycleLog !== null}
            onPress={() => setActiveSheet('cycle')}
          />
        )}
        <DashboardRow
          label="Notes"
          preview={hasNotesEntry ? notesPreview || 'Written' : 'Write about today'}
          completed={hasNotesEntry}
          onPress={() => setActiveSheet('notes')}
        />
      </Column>

      <AIReportCard date={date} />

      <FoodSheet visible={activeSheet === 'food'} onClose={closeSheet} date={date} />
      <WorkoutSheet visible={activeSheet === 'workout'} onClose={closeSheet} date={date} />
      <SleepSheet visible={activeSheet === 'sleep'} onClose={closeSheet} date={date} />
      <WeightSheet visible={activeSheet === 'weight'} onClose={closeSheet} date={date} />
      {cycleEnabled && <CycleSheet visible={activeSheet === 'cycle'} onClose={closeSheet} />}
      <NotesSheet visible={activeSheet === 'notes'} onClose={closeSheet} date={date} />
    </ScrollScreen>
  );
}
