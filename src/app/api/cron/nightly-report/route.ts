import { requireCronAuth } from "@/lib/cron/auth";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { runNightlyReportPipeline } from "@/lib/nightly-report/generate";
import { APP_TIME_ZONE, getLocalDateString } from "@/lib/date";

export const runtime = "nodejs";
export const maxDuration = 60;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Vercel Cron hits this once nightly with no query params (see
 * `vercel.json`) to generate and save the coach report automatically —
 * the unattended counterpart to the manual "Generate Nightly Report" ->
 * paste-into-Claude -> import flow, which stays available as a fallback
 * (nightly-report-card.tsx).
 *
 * Same CRON_SECRET-bearer auth also makes this a scriptable admin
 * endpoint for any date: `?date=YYYY-MM-DD` targets a past day instead of
 * today (e.g. re-running a batch of days after backfilling
 * `non_workout_steps` on each), and `?force=true` overwrites an existing
 * report instead of skipping it — the same override the UI's
 * "Regenerate" button already does, just reachable without a browser
 * session. Plain cron behavior (today, skip-if-exists) is what you get
 * with neither param, unchanged from before these existed.
 */
export async function GET(request: Request) {
  const auth = requireCronAuth(request);
  if (!auth) return new Response("Unauthorized.", { status: 401 });

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get("date");
  if (dateParam && !DATE_PATTERN.test(dateParam)) {
    return Response.json({ ok: false, error: "date must be YYYY-MM-DD." }, { status: 400 });
  }
  const force = searchParams.get("force") === "true";

  let date = dateParam;
  if (!date) {
    const { data: profile } = await auth.supabase
      .from("profiles")
      .select("timezone")
      .eq("id", auth.user.id)
      .maybeSingle();
    date = getLocalDateString(new Date(), profile?.timezone || APP_TIME_ZONE);
  }

  if (!force) {
    const existing = await getAiReportForDate(date, auth);
    if (existing) {
      return Response.json({ ok: true, skipped: true, reason: "Report already exists for this date.", date });
    }
  }

  try {
    const report = await runNightlyReportPipeline(date, auth);
    return Response.json({ ok: true, date, overallScore: report.overall_score });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed.";
    console.error(`[cron/nightly-report] Failed for ${date}:`, message);
    return Response.json({ ok: false, date, error: message }, { status: 500 });
  }
}
