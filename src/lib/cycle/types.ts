import type { Database } from "@/lib/supabase/database.types";

export type PeriodLog = Database["public"]["Tables"]["period_logs"]["Row"];

export type CyclePhase = "menstrual" | "follicular" | "ovulation" | "luteal";

export const CYCLE_PHASE_LABEL: Record<CyclePhase, string> = {
  menstrual: "Menstrual",
  follicular: "Follicular",
  ovulation: "Ovulation",
  luteal: "Luteal",
};

export interface CycleEstimate {
  cycleDay: number;
  phase: CyclePhase;
  cycleLengthDays: number;
  /** True when the most recent period has no ended_on yet and is being treated as ground-truth "currently menstruating" rather than assumed from a fixed length. */
  isOngoing: boolean;
}

export interface PeriodRange {
  startedOn: string;
  endedOn: string | null;
}
