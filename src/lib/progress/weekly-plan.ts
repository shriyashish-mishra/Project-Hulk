import { ALL_MUSCLE_REGIONS, MUSCLE_REGION_LABEL, type MuscleRegion } from "./muscle-map";

/**
 * Deterministic, rule-based — no live AI call. Matches the project's
 * constraint that the app itself never depends on an AI API; this is
 * plain logic over stored data, same as the rest of src/lib/progress.
 */

const UPPER_BODY: MuscleRegion[] = ["chest", "shoulders", "back", "arms"];

type Zone = "Upper Body" | "Lower Body" | "Core";

function zoneForRegion(region: MuscleRegion): Zone {
  if (region === "core") return "Core";
  if (UPPER_BODY.includes(region)) return "Upper Body";
  return "Lower Body";
}

export function computeProteinGoal(avgProteinG: number | null): number {
  const baseline = avgProteinG ?? 130;
  const target = Math.max(baseline * 1.08, 140);
  return Math.round(target / 5) * 5;
}

export interface WeeklyRoadmap {
  primaryFocus: string;
  secondaryFocus: string;
  suggestedSplit: string;
  recoveryAdvice: string;
  proteinGoalG: number;
  cardioGoal: string;
  mobilityGoal: string;
  coachNote: string;
}

/** Least-trained regions get priority, ranked by count then a fixed region order for stable ties. */
function rankByTrainingLoad(regionCounts: Map<MuscleRegion, number>): MuscleRegion[] {
  return [...ALL_MUSCLE_REGIONS].sort((a, b) => {
    const diff = (regionCounts.get(a) ?? 0) - (regionCounts.get(b) ?? 0);
    if (diff !== 0) return diff;
    return ALL_MUSCLE_REGIONS.indexOf(a) - ALL_MUSCLE_REGIONS.indexOf(b);
  });
}

export function generateWeeklyRoadmap(
  regionCounts: Map<MuscleRegion, number>,
  avgProteinG: number | null,
): WeeklyRoadmap {
  const ranked = rankByTrainingLoad(regionCounts);
  const primaryZone = zoneForRegion(ranked[0]);
  const secondaryCandidate = ranked.find((r) => zoneForRegion(r) !== primaryZone) ?? ranked[1];
  const secondaryZone = zoneForRegion(secondaryCandidate);

  const primaryFocus =
    primaryZone === "Core" ? "Core & Conditioning" : `${primaryZone} Strength`;
  const secondaryFocus =
    secondaryZone === "Core" ? "Core & Conditioning" : `${secondaryZone} Strength`;

  const splitZones = [primaryZone, secondaryZone, primaryZone, secondaryZone, "Core"];
  const suggestedSplit = splitZones
    .map((zone) => (zone === "Core" ? "Core" : zone.replace(" Body", "")))
    .join(" / ");

  const neglected = ALL_MUSCLE_REGIONS.filter(
    (region) => (regionCounts.get(region) ?? 0) === 0,
  ).map((region) => MUSCLE_REGION_LABEL[region]);

  const proteinGoalG = computeProteinGoal(avgProteinG);

  const recoveryAdvice =
    neglected.length > 0
      ? "7–8h sleep, 2 rest days, and full recovery between sessions on lagging areas."
      : "7–8h sleep, 2 rest days, stay hydrated.";

  const coachNote =
    neglected.length > 0
      ? `${neglected.join(" and ")} saw little to no direct work last week, so this roadmap gives them priority.`
      : "Last week covered every major muscle group — this roadmap keeps that balance while nudging intensity up.";

  return {
    primaryFocus,
    secondaryFocus,
    suggestedSplit,
    recoveryAdvice,
    proteinGoalG,
    cardioGoal: "2–3 sessions / week",
    mobilityGoal: "10 min / day",
    coachNote,
  };
}
