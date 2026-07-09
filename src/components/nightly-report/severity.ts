export type Severity = "success" | "warning" | "destructive";

export function severityForScore(score: number): Severity {
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "destructive";
}

export const SEVERITY_LABEL: Record<Severity, string> = {
  success: "Great",
  warning: "Good",
  destructive: "Needs work",
};
