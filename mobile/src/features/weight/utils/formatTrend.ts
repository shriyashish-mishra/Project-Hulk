import type { TrendDirection } from '../services';

export function formatTrendLabel(direction: TrendDirection, deltaKg: number): string {
  if (direction === 'flat') return 'Holding steady';
  const arrow = direction === 'up' ? '↑' : '↓';
  return `${arrow} ${Math.abs(deltaKg)} kg over the last week`;
}

export function formatShortDate(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
