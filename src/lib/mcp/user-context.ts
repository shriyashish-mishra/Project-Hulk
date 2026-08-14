import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { getLocalDateString } from "@/lib/date";
import type { UserContext } from "@/lib/profile/context";
import type { Profile } from "@/lib/profile/types";
import {
  calculateAge,
  calculateCalorieRangeKcal,
  calculateFiberTargetG,
  calculateHydrationTargetGlasses,
  calculateMacroTargetsG,
  calculateProteinTargetG,
  calculateSleepTargetMinutes,
} from "@/lib/profile/targets";
import {
  calculateAverageCycleLengthDays,
  estimateCyclePhase,
  DEFAULT_CYCLE_LENGTH_DAYS,
} from "@/lib/cycle/math";
import type { CycleEstimate, PeriodRange } from "@/lib/cycle/types";

const DEFAULT_HYDRATION_TARGET_GLASSES = 8;

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/**
 * A parallel `getUserContext` (`src/lib/profile/context.ts`) for callers
 * with a bearer-token-derived context (MCP) instead of a cookie session —
 * `getUserContext` goes through a cached RPC built on `getSupabaseClient()`
 * (cookie-bound), which a Route Handler hit by claude.ai's servers can't
 * use. Sources the same raw tables directly via `ctx.supabase` (still
 * RLS-scoped to the real user) and reuses the exact same pure calculation
 * functions, so the result matches `UserContext` field-for-field.
 */
export async function getUserContextForCtx(
  ctx: AuthContext,
  asOfDate: string = getLocalDateString(),
): Promise<UserContext> {
  const { supabase, user } = ctx;

  const [{ data: rawProfile }, { data: latestWeightLog }, { data: rawPeriods }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase
      .from("weight_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("measured_on", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("period_logs")
      .select("started_on, ended_on")
      .eq("user_id", user.id)
      .order("started_on", { ascending: true }),
  ]);

  const profile = rawProfile as Profile | null;

  if (!profile) {
    return {
      profile: null,
      age: null,
      latestWeightKg: null,
      proteinTargetG: null,
      calorieRangeKcal: null,
      carbsTargetG: null,
      fatTargetG: null,
      fiberTargetG: null,
      hydrationTargetGlasses: null,
      sleepTargetMinutes: null,
      cycleEstimate: null,
      periods: [],
    };
  }

  const latestWeightKg = latestWeightLog ? Number(latestWeightLog.weight_kg) : null;
  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;

  const proteinTargetG =
    profile.protein_target_g ??
    (latestWeightKg && profile.primary_goal
      ? calculateProteinTargetG(latestWeightKg, profile.primary_goal)
      : null);

  const calorieRangeKcal = calculateCalorieRangeKcal({
    dateOfBirth: profile.date_of_birth,
    biologicalSex: profile.biological_sex,
    heightCm: profile.height_cm,
    activityLevel: profile.activity_level,
    primaryGoal: profile.primary_goal,
    latestWeightKg,
  });

  const macroTargetsG = calculateMacroTargetsG(calorieRangeKcal, proteinTargetG, profile.primary_goal);
  const fiberTargetG = calculateFiberTargetG(calorieRangeKcal);

  const hydrationTargetGlasses = latestWeightKg
    ? calculateHydrationTargetGlasses({
        weightKg: latestWeightKg,
        biologicalSex: profile.biological_sex,
        age,
        heightCm: profile.height_cm,
      })
    : DEFAULT_HYDRATION_TARGET_GLASSES;

  const sleepTargetMinutes = calculateSleepTargetMinutes(age);

  const periods: PeriodRange[] =
    profile.biological_sex === "female"
      ? (rawPeriods ?? []).map((p) => ({ startedOn: p.started_on, endedOn: p.ended_on }))
      : [];

  let cycleEstimate: CycleEstimate | null = null;
  if (periods.length > 0) {
    const cycleLengthDays =
      calculateAverageCycleLengthDays(periods) ??
      profile.average_cycle_length_days ??
      DEFAULT_CYCLE_LENGTH_DAYS;
    cycleEstimate = estimateCyclePhase(periods, cycleLengthDays, asOfDate);
  }

  return {
    profile,
    age,
    latestWeightKg,
    proteinTargetG,
    calorieRangeKcal,
    carbsTargetG: macroTargetsG?.carbsG ?? null,
    fatTargetG: macroTargetsG?.fatG ?? null,
    fiberTargetG,
    hydrationTargetGlasses,
    sleepTargetMinutes,
    cycleEstimate,
    periods,
  };
}
