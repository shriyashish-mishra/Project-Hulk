import { ALL_MUSCLE_REGIONS, MUSCLE_REGION_LABEL, type MuscleRegion } from "./muscle-map";

/**
 * Deterministic, rule-based — no live AI call. Matches the project's
 * constraint that the app itself never depends on an AI API; this is
 * plain logic over stored data, same as the rest of src/lib/progress.
 */

const UPPER_BODY: MuscleRegion[] = ["chest", "shoulders", "back", "arms"];
const LOWER_BODY: MuscleRegion[] = ["quadriceps", "hamstrings", "glutes", "calves"];

type Zone = "Upper Body" | "Lower Body" | "Core";

const ZONE_REGIONS: Record<Zone, MuscleRegion[]> = {
  "Upper Body": UPPER_BODY,
  "Lower Body": LOWER_BODY,
  Core: ["core"],
};

const EXERCISE_LIBRARY: Record<MuscleRegion, string[]> = {
  chest: ["Incline Dumbbell Press — 4x10-12", "Dumbbell Chest Fly — 3x12", "Push-ups — 3x max"],
  shoulders: ["Lateral Raises — 4x12", "Around the World — 3x10", "Front Raises — 3x12"],
  back: ["Bent-over Dumbbell Row — 4x12", "Lat Pulldown — 4x10", "Seated Cable Row — 3x10"],
  arms: ["Bicep Curls — 3x12", "Overhead Tricep Extension — 3x12", "Hammer Curls — 3x10"],
  core: ["Plank — 3x45-60 sec", "Full Body Crunch — 4x15", "Mountain Climbers — 4x30 sec"],
  glutes: ["Sumo Squats — 4x15", "Glute Bridges — 4x15", "Kickbacks — 3x12 each side"],
  quadriceps: ["Goblet Squats — 4x12", "Normal Squats — 4x10", "Walking Lunges — 3x12 each leg"],
  hamstrings: ["Leg Curls — 3x10", "Romanian Deadlifts — 3x10", "Good Mornings — 3x10"],
  calves: ["Calf Raises — 3x15", "Seated Calf Raises — 3x15"],
};

function zoneForRegion(region: MuscleRegion): Zone {
  if (region === "core") return "Core";
  if (UPPER_BODY.includes(region)) return "Upper Body";
  return "Lower Body";
}

/** Picks exercises from the zone's least-trained regions first. */
function exercisesForZone(
  zone: Zone,
  regionCounts: Map<MuscleRegion, number>,
  total: number,
): string[] {
  const regions = [...ZONE_REGIONS[zone]].sort(
    (a, b) => (regionCounts.get(a) ?? 0) - (regionCounts.get(b) ?? 0),
  );
  const perRegion = Math.max(1, Math.ceil(total / regions.length));
  return regions.flatMap((r) => EXERCISE_LIBRARY[r].slice(0, perRegion)).slice(0, total);
}

export function computeProteinGoal(avgProteinG: number | null): number {
  const baseline = avgProteinG ?? 130;
  const target = Math.max(baseline * 1.08, 140);
  return Math.round(target / 5) * 5;
}

export interface PlannedDay {
  day: string;
  focus: string;
  exercises: string[];
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
  schedule: PlannedDay[];
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

  const splitZones: Zone[] = [primaryZone, secondaryZone, primaryZone, secondaryZone, "Core"];
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

  const schedule: PlannedDay[] = splitZones.map((zone, index) => ({
    day: `Day ${index + 1}`,
    focus: zone === "Core" ? "Core & Conditioning" : zone,
    exercises: exercisesForZone(zone, regionCounts, zone === "Core" ? 3 : 4),
  }));
  schedule.push({ day: `Day ${schedule.length + 1}`, focus: "Active Recovery", exercises: [] });
  schedule.push({ day: `Day ${schedule.length + 1}`, focus: "Rest", exercises: [] });

  return {
    primaryFocus,
    secondaryFocus,
    suggestedSplit,
    recoveryAdvice,
    proteinGoalG,
    cardioGoal: "2–3 sessions / week",
    mobilityGoal: "10 min / day",
    coachNote,
    schedule,
  };
}
