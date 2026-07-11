import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { PromptView } from "@/components/nightly-report/prompt-view";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { buildNightlyReportPrompt } from "@/lib/nightly-report/prompt";
import { getRecoveryPromptContext } from "@/lib/nightly-report/context";

export default async function GenerateReportPage() {
  const loggedOn = getLocalDateString();
  const [foodLogs, workoutLog, recoveryContext] = await Promise.all([
    getFoodLogsForDate(loggedOn),
    getWorkoutLogForDate(loggedOn),
    getRecoveryPromptContext(loggedOn),
  ]);

  const prompt = buildNightlyReportPrompt({
    date: loggedOn,
    foodLogs,
    workoutLog,
    ...recoveryContext,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
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
