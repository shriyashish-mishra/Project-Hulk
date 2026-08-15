import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getRecentAiReports } from "./queries";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

export interface RecentCalorieBalance {
  date: string;
  calorieBalance: string;
  calorieBalanceKcal: number | null;
}

const RECENT_CALORIE_BALANCE_LIMIT = 5;

/**
 * The last few days' calorie_balance readings, oldest-worthy-first-of-a-sort
 * (see usage in prompt.ts) — the ONLY continuity signal available for a
 * recomposition goal, since `calculateCalorieRangeKcal` deliberately never
 * hands any model a maintenance-calorie target to anchor a deficit against
 * (see profile/targets.ts). Without this, every model reinvents its own
 * implied TDEE from scratch each call — different models (or even the same
 * model on different days) land on different assumptions, so a provider
 * change can look like an unexplained jump in a person's own tracked
 * progress. Handing over the recent actual history instead makes staying
 * consistent an instruction any model can follow, not a hope that its
 * internal guess happens to match last week's.
 *
 * Excludes `excludeDate` (the day being generated/regenerated) so a
 * regenerate never anchors against its own prior guess.
 */
export async function getRecentCalorieBalanceContext(
  excludeDate: string,
  ctx?: AuthContext,
): Promise<RecentCalorieBalance[]> {
  const reports = await getRecentAiReports(RECENT_CALORIE_BALANCE_LIMIT + 1, ctx);

  return reports
    .filter((report) => report.report_date !== excludeDate)
    .slice(0, RECENT_CALORIE_BALANCE_LIMIT)
    .map((report) => ({
      date: report.report_date,
      calorieBalance: report.parsed_json.calorie_balance,
      calorieBalanceKcal: report.parsed_json.calorie_balance_kcal ?? null,
    }));
}
