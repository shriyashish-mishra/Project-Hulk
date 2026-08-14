import { requireCronAuth } from "@/lib/cron/auth";
import { getAiReportForDate } from "@/lib/nightly-report/queries";
import { runNightlyReportPipeline } from "@/lib/nightly-report/generate";
import { APP_TIME_ZONE, getLocalDateString } from "@/lib/date";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Vercel Cron hits this once nightly (see `vercel.json`) to generate and
 * save the coach report automatically — the unattended counterpart to the
 * manual "Generate Nightly Report" -> paste-into-Claude -> import flow,
 * which stays available as a fallback (nightly-report-card.tsx).
 *
 * Skips generating when a report already exists for the resolved date —
 * a manual generate/import earlier that day always wins over the
 * automatic run; this only fills in nights nobody touched by hand. Use
 * the existing "Regenerate"/"Re-import" actions to explicitly overwrite.
 */
export async function GET(request: Request) {
  const auth = requireCronAuth(request);
  if (!auth) return new Response("Unauthorized.", { status: 401 });

  const { data: profile } = await auth.supabase
    .from("profiles")
    .select("timezone")
    .eq("id", auth.user.id)
    .maybeSingle();
  const date = getLocalDateString(new Date(), profile?.timezone || APP_TIME_ZONE);

  const existing = await getAiReportForDate(date, auth);
  if (existing) {
    return Response.json({ ok: true, skipped: true, reason: "Report already exists for this date.", date });
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
