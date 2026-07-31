import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent } from "@/components/ui/card";
import { ActiveSession } from "@/components/workout-sessions/active-session";
import { getExerciseLibrary } from "@/lib/exercise-library/queries";
import { getSessionWithExercises } from "@/lib/workout-sessions/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";

interface ActiveSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ActiveSessionPage({ params }: ActiveSessionPageProps) {
  await requireOnboardedUser();
  const { sessionId } = await params;

  const [session, exercises] = await Promise.all([getSessionWithExercises(sessionId), getExerciseLibrary()]);
  if (!session) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/workouts" />
        <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground">{session.template_name_snapshot}</h1>
        {!session.completed_at && <p className="text-sm text-muted-foreground">In progress</p>}
      </div>
      <Card>
        <CardContent>
          <ActiveSession initialSession={session} exercises={exercises} />
        </CardContent>
      </Card>
    </div>
  );
}
