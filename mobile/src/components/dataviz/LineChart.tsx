import Svg, { Circle, Line, Path, Text as SvgText } from 'react-native-svg';

import { colors } from '@/core/theme';

export interface LineChartPoint {
  value: number;
  /** x-axis tick text, e.g. "Jul 1" — only a few are actually drawn, to avoid crowding. */
  label: string;
}

export interface LineChartProps {
  /** Oldest first. */
  actual: LineChartPoint[];
  /** Continues from the last `actual` point, drawn dashed — the goal/next-weight projection. */
  projected?: LineChartPoint[];
  height?: number;
}

const CHART_WIDTH = 320;
const PADDING_X = 28;
const PADDING_Y = 20;
const MAX_X_LABELS = 5;

function buildPath(points: { x: number; y: number }[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
}

/**
 * The one line chart in the app — actual progression plus a dashed
 * projected continuation, built on `react-native-svg` (already a
 * dependency for the muscle map) rather than adding a charting library.
 * Deliberately simple: no pan/zoom, no tooltips, no smoothing — a
 * straight-line read of "is this going up," matching `Sparkline`'s own
 * "answer the question at a glance" scope.
 */
export function LineChart({ actual, projected = [], height = 180 }: LineChartProps) {
  const allPoints = [...actual, ...projected];
  if (allPoints.length === 0) {
    return null;
  }

  const values = allPoints.map((point) => point.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  const plotWidth = CHART_WIDTH - PADDING_X * 2;
  const plotHeight = height - PADDING_Y * 2;
  const stepX = allPoints.length > 1 ? plotWidth / (allPoints.length - 1) : 0;

  function toCoords(point: LineChartPoint, index: number) {
    const x = PADDING_X + index * stepX;
    const y = PADDING_Y + plotHeight - ((point.value - minValue) / valueRange) * plotHeight;
    return { x, y };
  }

  const actualCoords = actual.map((point, index) => toCoords(point, index));
  const projectedCoords = projected.map((point, index) => toCoords(point, actual.length + index));
  const projectedPath = actualCoords.length > 0 ? [actualCoords[actualCoords.length - 1], ...projectedCoords] : projectedCoords;

  const labelIndices = new Set<number>();
  if (allPoints.length > 0) {
    const step = Math.max(1, Math.ceil(allPoints.length / MAX_X_LABELS));
    for (let index = 0; index < allPoints.length; index += step) {
      labelIndices.add(index);
    }
    labelIndices.add(allPoints.length - 1);
  }

  return (
    <Svg width="100%" height={height} viewBox={`0 0 ${CHART_WIDTH} ${height}`}>
      <Line
        x1={PADDING_X}
        y1={PADDING_Y + plotHeight}
        x2={CHART_WIDTH - PADDING_X}
        y2={PADDING_Y + plotHeight}
        stroke={colors.border}
        strokeWidth={1}
      />

      {actualCoords.length > 1 && <Path d={buildPath(actualCoords)} stroke={colors.primary} strokeWidth={2.5} fill="none" />}
      {projectedPath.length > 1 && (
        <Path
          d={buildPath(projectedPath)}
          stroke={colors.warning}
          strokeWidth={2}
          strokeDasharray="5,5"
          fill="none"
        />
      )}

      {actualCoords.map((coord, index) => (
        <Circle key={`actual-${index}`} cx={coord.x} cy={coord.y} r={3.5} fill={colors.primary} />
      ))}
      {projectedCoords.map((coord, index) => (
        <Circle key={`projected-${index}`} cx={coord.x} cy={coord.y} r={4} fill={colors.warning} />
      ))}

      {allPoints.map((point, index) => {
        if (!labelIndices.has(index)) return null;
        const coord = toCoords(point, index);
        return (
          <SvgText
            key={`label-${index}`}
            x={coord.x}
            y={height - 4}
            fontSize={9}
            fill={colors.mutedForeground}
            textAnchor="middle"
          >
            {point.label}
          </SvgText>
        );
      })}

      <SvgText x={2} y={PADDING_Y} fontSize={10} fill={colors.mutedForeground}>
        {maxValue}
      </SvgText>
      <SvgText x={2} y={PADDING_Y + plotHeight - 2} fontSize={10} fill={colors.mutedForeground}>
        {minValue}
      </SvgText>
    </Svg>
  );
}
