export interface PresetExerciseLine {
  name: string;
  detail?: string;
}

/**
 * Splits a preset's raw text into display-friendly lines — purely for
 * presentation, rawText stays the source of truth and is exactly what
 * gets applied when the preset is picked. Matches the block convention
 * the workout entry sheet already produces: blank-line-separated groups,
 * where a group's first line is the exercise name and any further lines
 * (weight, sets x reps, etc.) become its detail. Ported 1:1 from the web
 * app's `parsePresetExercises` so a preset previews identically on both
 * platforms.
 */
export function parsePresetExercises(rawText: string): PresetExerciseLine[] {
  return rawText
    .split(/\n\s*\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .map((block) => {
      const lines = block
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);
      const [name, ...rest] = lines;
      return rest.length > 0 ? { name, detail: rest.join(', ') } : { name };
    });
}
