import { notFound } from "next/navigation";
import { BackLink } from "@/components/ui/back-link";
import { Card, CardContent } from "@/components/ui/card";
import { TemplateEditor } from "@/components/workout-templates/template-editor";
import { getExerciseLibrary } from "@/lib/exercise-library/queries";
import { getTemplateWithExercises } from "@/lib/workout-templates/queries";
import { requireOnboardedUser } from "@/lib/supabase/auth";

interface TemplateEditorPageProps {
  params: Promise<{ templateId: string }>;
}

export default async function TemplateEditorPage({ params }: TemplateEditorPageProps) {
  await requireOnboardedUser();
  const { templateId } = await params;

  const [template, exercises] = await Promise.all([getTemplateWithExercises(templateId), getExerciseLibrary()]);
  if (!template) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/workouts" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">Edit Template</h1>
      </div>
      <Card>
        <CardContent>
          <TemplateEditor initialTemplate={template} exercises={exercises} />
        </CardContent>
      </Card>
    </div>
  );
}
