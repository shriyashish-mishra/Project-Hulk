import { BackLink } from "@/components/ui/back-link";
import { WorkoutsTabs } from "@/components/workouts/workouts-tabs";
import { ExerciseHistoryList } from "@/components/workout-sessions/exercise-history-list";
import { ExerciseOverview } from "@/components/workout-sessions/exercise-overview";
import { ExercisePickerStrip } from "@/components/workout-sessions/exercise-picker-strip";
import { InsightBanner } from "@/components/workout-sessions/insight-banner";
import { PersonalRecordsRow } from "@/components/workout-sessions/personal-records-row";
import { ProgressionChart } from "@/components/workout-sessions/progression-chart";
import { RecommendationCard } from "@/components/workout-sessions/recommendation-card";
import { RecommendationsOverview } from "@/components/workout-sessions/recommendations-overview";
import { getAllExerciseRecommendations, getExerciseProgressSummary } from "@/lib/workout-sessions/exercise-progress";
import { requireOnboardedUser } from "@/lib/supabase/auth";

interface WorkoutProgressPageProps {
  /** Keyed by exercise name (URL-encoded), not id — a report-only exercise has no `exercise_id` to key by. */
  searchParams: Promise<{ exercise?: string }>;
}

/**
 * Per-exercise progression — not a generic analytics dashboard, scoped
 * to exercises the user already trains inside their templates (plus any
 * exercise a past AI report recorded a weight for, even if it was never
 * added to the structured library). Section order: recommendations
 * overview (increase vs. hold, at a glance) → picker → overview → chart
 * → recommendation → personal records → session history → insight.
 */
export default async function WorkoutProgressPage({ searchParams }: WorkoutProgressPageProps) {
  await requireOnboardedUser();
  const { exercise: exerciseParam } = await searchParams;
  const selectedName = exerciseParam ? decodeURIComponent(exerciseParam).toLowerCase() : null;

  const recommendations = await getAllExerciseRecommendations();
  const exercises = recommendations.map((r) => r.exercise);
  const selected = exercises.find((exercise) => exercise.name.toLowerCase() === selectedName) ?? exercises[0] ?? null;
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
        <>
          <RecommendationsOverview summaries={recommendations} selectedExerciseName={selected?.name ?? ""} />
          <ExercisePickerStrip exercises={exercises} selectedExerciseName={selected?.name ?? ""} />
        </>
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
