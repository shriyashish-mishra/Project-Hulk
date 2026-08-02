// Same ambiguous-`ParsedAIReport`-export reasoning as prompts/index.ts —
// only the current version is barrel-exported; v1 stays reachable by
// direct import if ever needed.
export * from './dailyReportParser.v2';
