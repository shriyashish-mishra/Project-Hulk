/** Formats milliliters as a compact liter string, e.g. `2100` → `"2.1L"`. */
export function formatLiters(ml: number): string {
  return `${(ml / 1000).toFixed(1)}L`;
}
