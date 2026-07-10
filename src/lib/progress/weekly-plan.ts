import { ALL_MUSCLE_REGIONS, MUSCLE_REGION_LABEL, type MuscleRegion } from "./muscle-map";

export interface PlannedDay {
  day: string;
  focus: string;
  exercises: string[];
}

export interface WeeklyPlan {
  days: PlannedDay[];
  proteinGoalG: number;
  coachNote: string;
}

/**
 * Deterministic, rule-based — no live AI call. Matches the project's
 * constraint that the app itself never depends on an AI API; this is
 * plain logic over stored data, same as the rest of src/lib/progress.
 */
const EXERCISE_LIBRARY: Record<MuscleRegion, string[]> = {
  chest: [
    "Incline Dumbbell Press — 4 x 10-12",
    "Dumbbell Chest Fly — 3 x 12",
    "Push-ups — 3 x max",
  ],
  shoulders: [
    "Lateral Raises — 4 x 12",
    "Around the World — 3 x 10",
    "Front Raises — 3 x 12",
  ],
  back: [
    "Bent-over Dumbbell Row — 4 x 12",
    "Lat Pulldown — 4 x 10",
    "Seated Cable Row — 3 x 10",
  ],
  arms: [
    "Bicep Curls — 3 x 12",
    "Overhead Tricep Extension — 3 x 12",
    "Hammer Curls — 3 x 10",
  ],
  core: [
    "Plank — 3 x 45-60 sec",
    "Full Body Crunch — 4 x 15",
    "Mountain Climbers — 4 x 30 sec",
  ],
  glutes: [
    "Sumo Squats — 4 x 15",
    "Glute Bridges — 4 x 15",
    "Kickbacks — 3 x 12 each side",
  ],
  quadriceps: [
    "Goblet Squats — 4 x 12",
    "Normal Squats — 4 x 10",
    "Walking Lunges — 3 x 12 each leg",
  ],
  hamstrings: [
    "Leg Curls — 3 x 10",
    "Romanian Deadlifts — 3 x 10",
    "Good Mornings — 3 x 10",
  ],
  calves: ["Calf Raises — 3 x 15", "Seated Calf Raises — 3 x 15"],
};

const DAY_TEMPLATE: Array<{
  day: string;
  focus: string;
  regions: MuscleRegion[];
}> = [
  { day: "Monday", focus: "Push — Chest & Shoulders", regions: ["chest", "shoulders"] },
  { day: "Tuesday", focus: "Pull — Back", regions: ["back"] },
  {
    day: "Wednesday",
    focus: "Legs — Quads, Glutes & Calves",
    regions: ["quadriceps", "glutes", "calves"],
  },
  { day: "Thursday", focus: "Active Recovery — Core & Cardio", regions: ["core"] },
  { day: "Friday", focus: "Arms & Core", regions: ["arms", "core"] },
  {
    day: "Saturday",
    focus: "Posterior Chain — Hamstrings, Glutes & Calves",
    regions: ["hamstrings", "glutes", "calves"],
  },
  { day: "Sunday", focus: "Rest", regions: [] },
];

function pickExercises(regions: MuscleRegion[], totalTarget = 5): string[] {
  if (regions.length === 0) return [];
  const perRegion = Math.max(1, Math.round(totalTarget / regions.length));
  return regions.flatMap((region) => EXERCISE_LIBRARY[region].slice(0, perRegion));
}

export function computeProteinGoal(avgProteinG: number | null): number {
  const baseline = avgProteinG ?? 130;
  const target = Math.max(baseline * 1.08, 140);
  return Math.round(target / 5) * 5;
}

export function generateWeeklyPlan(
  regionCounts: Map<MuscleRegion, number>,
  avgProteinG: number | null,
): WeeklyPlan {
  const days: PlannedDay[] = DAY_TEMPLATE.map(({ day, focus, regions }) => ({
    day,
    focus,
    exercises: pickExercises(regions),
  }));

  const proteinGoalG = computeProteinGoal(avgProteinG);

  const underTrained = ALL_MUSCLE_REGIONS.filter(
    (region) => (regionCounts.get(region) ?? 0) === 0,
  ).map((region) => MUSCLE_REGION_LABEL[region]);

  const coachNote =
    underTrained.length > 0
      ? `${underTrained.join(" and ")} saw little to no direct work last week, so this plan gives them dedicated attention. Aim for ${proteinGoalG}g of protein daily to support the load, and treat Sunday as a full rest day before starting again.`
      : `Last week covered every major muscle group — this plan keeps that balance while nudging protein up to ${proteinGoalG}g daily. Treat Sunday as a full rest day before starting again.`;

  return { days, proteinGoalG, coachNote };
}
