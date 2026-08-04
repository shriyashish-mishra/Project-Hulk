import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutsTabs } from "@/components/workouts/workouts-tabs";
import { TemplatesList } from "@/components/workout-templates/templates-list";
import { listTemplates } from "@/lib/workout-templates/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";

/**
 * The Workouts tab's Templates page. Weight progression moved to the
 * dedicated Progress tab (a per-exercise deep dive, not a compact tile
 * grid) and Recent Workouts is gone entirely — both were removed by
 * request, not accidental duplication this time.
 */
export default async function WorkoutsPage() {
  await requireOnboardedUser();

  const templates = await listTemplates();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Workouts</h1>
        <p className="text-sm text-muted-foreground">
          Build a template, start a session, or just log the way you always have from Today&rsquo;s Journal.
        </p>
      </div>

      <WorkoutsTabs active="templates" />

      <Card>
        <CardHeader>
          <CardTitle>Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplatesList templates={templates} />
        </CardContent>
      </Card>
    </div>
  );
}
