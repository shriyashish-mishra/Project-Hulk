// Each versioned prompt file exports its own `PROMPT_VERSION` constant —
// wildcard re-exporting more than one from this barrel is ambiguous, so
// only the current version is exported here. Frozen old versions (v1)
// stay reachable by importing the file directly if ever needed.
export * from './dailyReport.v2';
