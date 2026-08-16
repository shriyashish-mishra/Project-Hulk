import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent } from "@/components/ui/card";
import { ActiveSession } from "@/components/workout-sessions/active-session";
import { getExerciseLibrary } from "@/lib/exercise-library/queries";
import { getSessionWeightSuggestions } from "@/lib/workout-sessions/exercise-progress";
import { getSessionWithExercises } from "@/lib/workout-sessions/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";
import { getUserContext } from "@/lib/profile/context";

interface ActiveSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ActiveSessionPage({ params }: ActiveSessionPageProps) {
  await requireOnboardedUser();
  const { sessionId } = await params;

  const [session, exercises, userContext] = await Promise.all([
    getSessionWithExercises(sessionId),
    getExerciseLibrary(),
    getUserContext(),
  ]);
  if (!session) notFound();

  // Only meaningful while the session is still in progress — once
  // completed, the weight shown is history, not a suggestion.
  const weightSuggestions = session.completed_at ? {} : await getSessionWeightSuggestions(session);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/workouts" />
        <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">{session.template_name_snapshot}</h1>
        {!session.completed_at && <p className="text-sm text-muted-foreground">In progress</p>}
      </div>
      <Card>
        <CardContent>
          <ActiveSession
            initialSession={session}
            exercises={exercises}
            weightSuggestions={weightSuggestions}
            bodyweightKg={userContext.latestWeightKg}
          />
        </CardContent>
      </Card>
    </div>
  );
}
