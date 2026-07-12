import Link from "next/link";
import { BackLink } from "@/components/ui/back-link";
import { PromptView } from "@/components/nightly-report/prompt-view";
import { formatDateHeading, getLocalDateString } from "@/lib/date";
import { getFoodLogsForDate } from "@/lib/food-logs/queries";
import { getWorkoutLogForDate } from "@/lib/workout-logs/queries";
import { buildNightlyReportPrompt } from "@/lib/nightly-report/prompt";
import { getRecoveryPromptContext } from "@/lib/nightly-report/context";
import { getWeekSoFarContext } from "@/lib/nightly-report/week-context";
import { getUserContext } from "@/lib/profile/context";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface GenerateReportPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function GenerateReportPage({ searchParams }: GenerateReportPageProps) {
  await requireOnboardedUser();
  const { date: dateParam } = await searchParams;
  const today = getLocalDateString();
  const loggedOn =
    dateParam && DATE_PATTERN.test(dateParam) && dateParam <= today ? dateParam : today;
  const isToday = loggedOn === today;

  const [foodLogs, workoutLog, recoveryContext, userContext, weekSoFar] = await Promise.all([
    getFoodLogsForDate(loggedOn),
    getWorkoutLogForDate(loggedOn),
    getRecoveryPromptContext(loggedOn),
    getUserContext(),
    getWeekSoFarContext(loggedOn),
  ]);

  const prompt = buildNightlyReportPrompt({
    date: loggedOn,
    foodLogs,
    workoutLog,
    ...recoveryContext,
    userContext,
    weekSoFar,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href={isToday ? "/" : `/log/${loggedOn}`} />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Nightly Report Prompt
        </h1>
        <p className="text-sm text-muted-foreground">
          {formatDateHeading(new Date(`${loggedOn}T00:00:00`))}
        </p>
      </div>

      <PromptView prompt={prompt} />

      <Link
        href={`/report/import?date=${loggedOn}`}
        className="text-center text-sm text-primary underline-offset-4 hover:underline"
      >
        Already have Claude&rsquo;s response? Import it →
      </Link>
    </div>
  );
}
