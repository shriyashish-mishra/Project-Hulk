export type MuscleGroupId =
  | "chest"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "forearms"
  | "core"
  | "obliques"
  | "upper_back"
  | "lats"
  | "lower_back"
  | "glutes"
  | "quadriceps"
  | "hamstrings"
  | "calves";

export const ALL_MUSCLE_GROUPS: MuscleGroupId[] = [
  "chest",
  "shoulders",
  "biceps",
  "triceps",
  "forearms",
  "core",
  "obliques",
  "upper_back",
  "lats",
  "lower_back",
  "glutes",
  "quadriceps",
  "hamstrings",
  "calves",
];

/**
 * Maps a free-text muscle name from an AI report (e.g. "quads", "abs",
 * "traps") to the fine-grained muscle groups the body map can highlight.
 * Same normalization role as mapMuscleNameToRegions in muscle-map.ts, but
 * targeting the 14-group anatomy of the approved muscle-map asset instead
 * of the coarser 9-region model used elsewhere in Progress.
 */
export function mapMuscleNameToGroups(name: string): MuscleGroupId[] {
  const lower = name.toLowerCase().trim();

  if (lower === "legs" || lower === "leg") {
    return ["quadriceps", "hamstrings", "calves"];
  }
  if (lower === "arms" || lower === "arm") {
    return ["biceps", "triceps", "forearms"];
  }

  const groups: MuscleGroupId[] = [];
  if (/chest|pec/.test(lower)) groups.push("chest");
  if (/shoulder|delt/.test(lower)) groups.push("shoulders");
  if (/bicep/.test(lower)) groups.push("biceps");
  if (/tricep/.test(lower)) groups.push("triceps");
  if (/forearm/.test(lower)) groups.push("forearms");
  if (/oblique/.test(lower)) groups.push("obliques");
  else if (/\bcore\b|\babs?\b|abdominal/.test(lower)) groups.push("core");
  if (/trap/.test(lower)) groups.push("upper_back");
  if (/\blats?\b|latissimus/.test(lower)) groups.push("lats");
  if (/lower back|lumbar/.test(lower)) groups.push("lower_back");
  if (/glute/.test(lower)) groups.push("glutes");
  if (/quad/.test(lower)) groups.push("quadriceps");
  if (/hamstring/.test(lower)) groups.push("hamstrings");
  if (/calv/.test(lower)) groups.push("calves");

  // A generic "back" with no more specific match spreads across all three back regions.
  if (/\bback\b/.test(lower) && !groups.includes("upper_back") && !groups.includes("lats")) {
    groups.push("upper_back", "lats", "lower_back");
  }

  return groups;
}

/** How many days (within the given list) trained each muscle group at least once. */
export function computeMuscleGroupCounts(
  musclesTrainedByDay: string[][],
): Map<MuscleGroupId, number> {
  const counts = new Map<MuscleGroupId, number>();
  for (const muscleNames of musclesTrainedByDay) {
    const groupsHitToday = new Set<MuscleGroupId>();
    for (const name of muscleNames) {
      for (const group of mapMuscleNameToGroups(name)) groupsHitToday.add(group);
    }
    for (const group of groupsHitToday) {
      counts.set(group, (counts.get(group) ?? 0) + 1);
    }
  }
  return counts;
}

/** Normalizes group counts to a 0-1 intensity map, suitable for <MuscleMap intensity={...} />. */
export function computeMuscleGroupIntensity(
  musclesTrainedByDay: string[][],
): Partial<Record<MuscleGroupId, number>> {
  const counts = computeMuscleGroupCounts(musclesTrainedByDay);
  const maxCount = Math.max(1, ...Array.from(counts.values()));
  const intensity: Partial<Record<MuscleGroupId, number>> = {};
  for (const [group, count] of counts) {
    intensity[group] = Math.min(1, count / maxCount);
  }
  return intensity;
}
