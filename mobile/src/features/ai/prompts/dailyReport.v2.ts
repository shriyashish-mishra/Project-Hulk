import type { ClaudePromptPackage, DailyHealthContext, TargetsContext } from '../types';

/**
 * v2 adds structured nutrition/workout numbers (calories, macros, calorie
 * balance, muscles trained, per-exercise detail) that v1 never asked for —
 * these are what the Progress tab's muscle map, nutrient-target bars, and
 * calorie balance chart are built on. Never edit this file's prompt text
 * once it's shipped — add `dailyReport.v3.ts` instead, same rule as v1.
 */
export const PROMPT_VERSION = 'dailyReport.v2';

const RESPONSE_SHAPE_HINT = `{
  "summary": "string — a concise overview of the day",
  "scores": { "nutrition": "number 0-100", "activity": "number 0-100", "recovery": "number 0-100" },
  "wins": ["string — what went well"],
  "improvements": ["string — actionable improvements"],
  "nutritionFeedback": "string — feedback based on logged meals",
  "workoutFeedback": "string — feedback based on activity",
  "recoveryFeedback": "string — feedback based on sleep and hydration",
  "tomorrowSuggestions": ["string — small, practical suggestions for tomorrow"],
  "estimatedCalories": "number",
  "proteinG": "number",
  "carbsG": "number",
  "fatG": "number",
  "fiberG": "number",
  "calorieBalanceText": "string — e.g. '-320 kcal (deficit)'",
  "calorieBalanceKcal": "number — signed, negative is a deficit, positive a surplus",
  "musclesTrained": ["string — e.g. 'chest', 'shoulders', 'quadriceps'"],
  "workoutDurationMin": "number, or null if no workout logged",
  "workoutCaloriesBurned": "number, or null if no workout logged",
  "workoutExercises": [{ "name": "string", "detail": "string, e.g. '4x10 @ 60lbs'", "caloriesBurned": "number, best-effort, optional" }]
}`;

function buildTargetsMarkdown(targets: TargetsContext): string {
  if (!targets.primaryGoal && !targets.calorieRangeKcal) return 'Not set up yet.';

  const lines: string[] = [];
  if (targets.primaryGoal) lines.push(`Goal: ${targets.primaryGoal.replace('_', ' ')}`);
  if (targets.activityLevel) lines.push(`Activity level outside training: ${targets.activityLevel.replace('_', ' ')}`);
  if (targets.trainingFrequency) lines.push(`Usual training frequency: ${targets.trainingFrequency.replace('_', ' ')} days/week`);
  if (targets.proteinTargetG) lines.push(`Protein target: ${targets.proteinTargetG}g/day`);
  if (targets.calorieRangeKcal) lines.push(`Calorie range: ${targets.calorieRangeKcal.min}–${targets.calorieRangeKcal.max} kcal/day`);
  if (targets.carbsTargetG) lines.push(`Carb target: ${targets.carbsTargetG}g/day`);
  if (targets.fatTargetG) lines.push(`Fat target: ${targets.fatTargetG}g/day`);
  if (targets.fiberTargetG) lines.push(`Fibre target: ${targets.fiberTargetG}g/day`);
  if (targets.targetWeightKg) lines.push(`Target weight: ${targets.targetWeightKg}kg`);
  return lines.length > 0 ? lines.join('\n') : 'Not set up yet.';
}

/**
 * Turns a `DailyHealthContext` into the exact text handed to Claude. Pure
 * and I/O-free — building a prompt never touches SQLite, the clipboard,
 * or the share sheet; that belongs to whatever calls this.
 */
export function buildDailyReportPromptV2(context: DailyHealthContext): ClaudePromptPackage {
  const lines: string[] = [
    "You are a supportive, encouraging health and fitness coach — not a strict trainer, and not a doctor. Based on the structured data below from a single day, write a short daily health report.",
    '',
    'About me:',
    buildTargetsMarkdown(context.targets),
    '',
    'Respond with ONLY a single JSON object — no other text before or after it — matching exactly this shape:',
    RESPONSE_SHAPE_HINT,
    '',
    'Guidelines:',
    '- Supportive coach tone throughout — never judgmental, never a drill sergeant.',
    '- No medical advice, no diagnosis, no extreme dieting suggestions.',
    '- Keep suggestions small and practical, not overwhelming — one or two per section is enough.',
    '- Base every observation only on the data below — do not invent details that aren\'t there.',
    '- If something (a meal, a workout, sleep) wasn\'t logged, treat that as "no data," not "did nothing worth mentioning" — don\'t guilt the user for gaps.',
    '- Estimate calories, protein, carbs, fat, and fibre from the logged meals as best you can — a reasonable estimate beats leaving it blank.',
    '- Estimate the workout duration, total calories burned, and each individual exercise with its own best-effort calories-burned estimate — leave an exercise\'s calories off (or leave the exercise out) if the log genuinely doesn\'t support a guess.',
    '- For machine/cable exercises (lat pulldown, machine row, face pull, tricep pushdown, and anything else clearly done on a machine or cable stack), always report the weight unit as lbs in the exercise detail, even if the log says kg — that\'s always what\'s meant there. Leave every dumbbell/barbell weight exactly as logged, unit and all.',
    '- Weigh nutrition/activity/recovery scores and feedback against the goal and targets under "About me" above, when set — not generic advice.',
    '- Judge the activity score only on the quality and effort of what was actually trained today, never on whether every muscle group was hit (that\'s a weekly question, not a daily one).',
    '',
    'DATA:',
    JSON.stringify(context, null, 2),
  ];

  return {
    promptVersion: PROMPT_VERSION,
    contextVersion: context.contextVersion,
    text: lines.join('\n'),
  };
}
