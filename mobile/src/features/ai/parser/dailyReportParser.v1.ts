import type { AIReportContent } from '../types';

export interface ParsedAIReport {
  content: AIReportContent;
  /** Empty when parsing went cleanly. Non-empty means some fields fell back to defaults — surface this to the user rather than pretending the report is more precise than it is. */
  parseWarnings: string[];
}

const DEFAULT_SCORE = 50;

function extractJsonBlock(text: string): string | null {
  // Claude sometimes wraps its answer in a ```json fenced block even when
  // told not to add extra text — unwrap that before looking for the object.
  const fenced = /```(?:json)?\s*([\s\S]*?)```/i.exec(text);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf('{');
  const end = candidate.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  return candidate.slice(start, end + 1);
}

/**
 * Turns the raw text a user pastes back from Claude into `AIReportContent`
 * — matched to what `dailyReport.v1`'s prompt asked for. Never throws:
 * a manual copy/paste workflow will always see the occasional malformed
 * or off-shape reply, and losing what the user pasted would be worse
 * than a best-effort, partially-defaulted parse.
 */
export function parseDailyReportV1(rawResponse: string): ParsedAIReport {
  const warnings: string[] = [];
  const jsonText = extractJsonBlock(rawResponse);

  let parsed: unknown = null;
  if (jsonText === null) {
    warnings.push("Couldn't find a JSON object in the response — using the raw text as the summary instead.");
  } else {
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      warnings.push("Couldn't parse the response as JSON — using the raw text as the summary instead.");
    }
  }

  const obj = parsed !== null && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : null;
  const scoresObj =
    obj?.scores !== undefined && typeof obj.scores === 'object' && obj.scores !== null
      ? (obj.scores as Record<string, unknown>)
      : null;

  function readString(key: string, fallback: string): string {
    const value = obj?.[key];
    if (typeof value === 'string') return value;
    if (obj !== null) warnings.push(`Missing "${key}" — left blank.`);
    return fallback;
  }

  function readStringArray(key: string): string[] {
    const value = obj?.[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string');
    }
    if (obj !== null) warnings.push(`Missing "${key}" — left empty.`);
    return [];
  }

  function readScore(key: string): number {
    const value = scoresObj?.[key];
    if (typeof value === 'number' && Number.isFinite(value)) {
      return Math.max(0, Math.min(100, Math.round(value)));
    }
    warnings.push(`Missing or invalid "${key}" score — defaulted to ${DEFAULT_SCORE}.`);
    return DEFAULT_SCORE;
  }

  const content: AIReportContent = {
    summary: obj ? readString('summary', '') : rawResponse.trim(),
    scores: {
      nutrition: readScore('nutrition'),
      activity: readScore('activity'),
      recovery: readScore('recovery'),
    },
    wins: readStringArray('wins'),
    improvements: readStringArray('improvements'),
    nutritionFeedback: readString('nutritionFeedback', ''),
    workoutFeedback: readString('workoutFeedback', ''),
    recoveryFeedback: readString('recoveryFeedback', ''),
    tomorrowSuggestions: readStringArray('tomorrowSuggestions'),
    rawResponse,
  };

  return { content, parseWarnings: warnings };
}
