/** What a prompt builder produces — the exact text to hand to Claude, tagged with which prompt and context shape produced it. */
export interface ClaudePromptPackage {
  promptVersion: string;
  contextVersion: string;
  text: string;
}
