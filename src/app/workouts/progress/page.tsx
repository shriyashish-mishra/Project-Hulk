import { BackLink } from "@/components/ui/back-link";
import { WorkoutsTabs } from "@/components/workouts/workouts-tabs";
import { ExerciseHistoryList } from "@/components/workout-sessions/exercise-history-list";
import { ExerciseOverview } from "@/components/workout-sessions/exercise-overview";
import { ExercisePickerStrip } from "@/components/workout-sessions/exercise-picker-strip";
import { InsightBanner } from "@/components/workout-sessions/insight-banner";
import { PersonalRecordsRow } from "@/components/workout-sessions/personal-records-row";
import { ProgressionChart } from "@/components/workout-sessions/progression-chart";
import { RecommendationCard } from "@/components/workout-sessions/recommendation-card";
import { getExerciseProgressSummary, getRecentlyTrainedExercises } from "@/lib/workout-sessions/exercise-progress";
import { requireOnboardedUser } from "@/lib/supabase/auth";

interface WorkoutProgressPageProps {
  searchParams: Promise<{ exercise?: string }>;
}

/**
 * Per-exercise progression — not a generic analytics dashboard, scoped
 * to exercises the user already trains inside their templates. Section
 * order follows the spec exactly: picker → overview → chart →
 * recommendation → personal records → session history → insight.
 */
export default async function WorkoutProgressPage({ searchParams }: WorkoutProgressPageProps) {
  await requireOnboardedUser();
  const { exercise: exerciseParam } = await searchParams;

  const exercises = await getRecentlyTrainedExercises();
  const selected = exercises.find((exercise) => exercise.exercise_id === exerciseParam) ?? exercises[0] ?? null;
  const summary = selected ? await getExerciseProgressSummary(selected) : null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/workouts" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Workouts</h1>
      </div>

      <WorkoutsTabs active="progress" />

      {exercises.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">
          Complete a workout session with a strength exercise to start seeing progression here.
        </p>
      ) : (
        <ExercisePickerStrip exercises={exercises} selectedExerciseId={selected?.exercise_id ?? ""} />
      )}

      {summary && (
        <div className="flex flex-col gap-6">
          <ExerciseOverview history={summary.history} personalRecords={summary.personal_records} trend={summary.trend} />
          <ProgressionChart history={summary.history} recommendation={summary.recommendation} />
          <RecommendationCard recommendation={summary.recommendation} unit={summary.exercise.default_unit} />
          <PersonalRecordsRow personalRecords={summary.personal_records} unit={summary.exercise.default_unit} />
          <ExerciseHistoryList history={summary.history} />
          <InsightBanner insight={summary.insight} />
        </div>
      )}
    </div>
  );
}
