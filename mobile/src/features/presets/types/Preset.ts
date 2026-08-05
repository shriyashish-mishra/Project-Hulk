/** A saved, reusable free-text blob — picking one appends its rawText into whatever log entry is open. Same shape for both food and workout presets. */
export interface Preset {
  id: number;
  rawText: string;
  createdAt: string;
}
