export type MuscleRegion =
  | "shoulders"
  | "chest"
  | "back"
  | "arms"
  | "core"
  | "glutes"
  | "quadriceps"
  | "hamstrings"
  | "calves";

export const MUSCLE_REGION_LABEL: Record<MuscleRegion, string> = {
  shoulders: "Shoulders",
  chest: "Chest",
  back: "Back",
  arms: "Arms",
  core: "Core",
  glutes: "Glutes",
  quadriceps: "Quads",
  hamstrings: "Hamstrings",
  calves: "Calves",
};

export const ALL_MUSCLE_REGIONS: MuscleRegion[] = [
  "shoulders",
  "chest",
  "back",
  "arms",
  "core",
  "glutes",
  "quadriceps",
  "hamstrings",
  "calves",
];

/** Maps a free-text muscle name from an AI report to zero or more diagram regions. */
export function mapMuscleNameToRegions(name: string): MuscleRegion[] {
  const lower = name.toLowerCase().trim();

  if (lower === "legs" || lower === "leg") {
    return ["quadriceps", "hamstrings", "calves"];
  }

  const regions: MuscleRegion[] = [];
  if (/chest|pec/.test(lower)) regions.push("chest");
  if (/shoulder|delt/.test(lower)) regions.push("shoulders");
  if (/\bback\b|\blat/.test(lower)) regions.push("back");
  if (/bicep|tricep|\barm/.test(lower)) regions.push("arms");
  if (/\bcore\b|\babs?\b|abdominal|oblique/.test(lower)) regions.push("core");
  if (/glute/.test(lower)) regions.push("glutes");
  if (/quad/.test(lower)) regions.push("quadriceps");
  if (/hamstring/.test(lower)) regions.push("hamstrings");
  if (/calv/.test(lower)) regions.push("calves");

  return regions;
}

/** Aggregates how many times each diagram region was trained across a list of daily muscle lists. */
export function computeRegionCounts(
  muscleNamesByDay: string[][],
): Map<MuscleRegion, number> {
  const counts = new Map<MuscleRegion, number>();
  for (const muscleNames of muscleNamesByDay) {
    const regionsHitToday = new Set<MuscleRegion>();
    for (const name of muscleNames) {
      for (const region of mapMuscleNameToRegions(name)) {
        regionsHitToday.add(region);
      }
    }
    for (const region of regionsHitToday) {
      counts.set(region, (counts.get(region) ?? 0) + 1);
    }
  }
  return counts;
}
