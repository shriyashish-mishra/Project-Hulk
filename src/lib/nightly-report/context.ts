import { requireUser } from "@/lib/supabase/auth";
import { getWaterLogForDate } from "@/lib/water/queries";
import { getSleepLogForDate } from "@/lib/sleep/queries";
import { getWeightLogForDate, getLatestWeightLogBefore } from "@/lib/weight/queries";
import { getPhotoViewsForDate } from "@/lib/photos/queries";
import type { WaterLog } from "@/lib/water/types";
import type { SleepLog } from "@/lib/sleep/types";
import type { WeightLog } from "@/lib/weight/types";
import type { PhotoViewType } from "@/lib/photos/types";

const MAX_PRIOR_WEIGHT_DAYS = 14;

export interface RecoveryPromptContext {
  waterLog: WaterLog | null;
  sleepLog: SleepLog | null;
  weightLog: WeightLog | null;
  priorWeight: { log: WeightLog; daysAgo: number } | null;
  photoViewsCaptured: PhotoViewType[];
}

/** Same data for a given date whether it's about to be shown in the prompt or re-derived when storing an imported report. `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getRecoveryPromptContext(
  date: string,
  ctx?: Awaited<ReturnType<typeof requireUser>>,
): Promise<RecoveryPromptContext> {
  const [waterLog, sleepLog, weightLog, photoViewsCaptured] = await Promise.all([
    getWaterLogForDate(date, ctx),
    getSleepLogForDate(date, ctx),
    getWeightLogForDate(date, ctx),
    getPhotoViewsForDate(date, ctx),
  ]);

  let priorWeight: RecoveryPromptContext["priorWeight"] = null;
  if (!weightLog) {
    const prior = await getLatestWeightLogBefore(date, ctx);
    if (prior) {
      const daysAgo = Math.round(
        (Date.parse(date) - Date.parse(prior.measured_on)) / 86_400_000,
      );
      if (daysAgo <= MAX_PRIOR_WEIGHT_DAYS) {
        priorWeight = { log: prior, daysAgo };
      }
    }
  }

  return { waterLog, sleepLog, weightLog, priorWeight, photoViewsCaptured };
}
