import type { ClaudePromptPackage, DailyHealthContext } from '../types';

/**
 * Bumped whenever the requested response shape or instructions change in
 * a way that would break the v1 parser. Never edit this file's prompt
 * text once it's shipped — add `dailyReport.v2.ts` instead, the same
 * append-only rule as the SQLite migrations.
 */
export const PROMPT_VERSION = 'dailyReport.v1';

const RESPONSE_SHAPE_HINT = `{
  "summary": "string — a concise overview of the day",
  "scores": { "nutrition": "number 0-100", "activity": "number 0-100", "recovery": "number 0-100" },
  "wins": ["string — what went well"],
  "improvements": ["string — actionable improvements"],
  "nutritionFeedback": "string — feedback based on logged meals",
  "workoutFeedback": "string — feedback based on activity",
  "recoveryFeedback": "string — feedback based on sleep and hydration",
  "tomorrowSuggestions": ["string — small, practical suggestions for tomorrow"]
}`;

/**
 * Turns a `DailyHealthContext` into the exact text handed to Claude. Pure
 * and I/O-free — building a prompt never touches SQLite, the clipboard,
 * or the share sheet; that belongs to whatever calls this.
 */
export function buildDailyReportPromptV1(context: DailyHealthContext): ClaudePromptPackage {
  const lines: string[] = [
    "You are a supportive, encouraging health and fitness coach — not a strict trainer, and not a doctor. Based on the structured data below from a single day, write a short daily health report.",
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
