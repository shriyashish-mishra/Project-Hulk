import Link from "next/link";
import { PromptView } from "@/components/nightly-report/prompt-view";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { buildNightlyReportPrompt } from "@/lib/nightly-report/prompt";

export default async function GenerateReportPage() {
  const loggedOn = getLocalDateString();
  const [foodLogs, workoutLog] = await Promise.all([
    getFoodLogsForDate(loggedOn),
    getWorkoutLogForDate(loggedOn),
  ]);

  const prompt = buildNightlyReportPrompt({ date: loggedOn, foodLogs, workoutLog });

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← Back
        </Link>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Nightly Report Prompt
        </h1>
        <p className="text-sm text-muted-foreground">{formatDateHeading()}</p>
      </div>

      <PromptView prompt={prompt} />

      <Link
        href="/report/import"
        className="text-center text-sm text-primary underline-offset-4 hover:underline"
      >
        Already have Claude&rsquo;s response? Import it →
      </Link>
    </div>
  );
}
