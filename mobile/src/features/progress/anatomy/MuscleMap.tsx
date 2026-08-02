import { useId } from 'react';
import { View } from 'react-native';
import Svg, { ClipPath, Defs, G, Path } from 'react-native-svg';

import { colors } from '@/core/theme';
import { Caption } from '@/components/typography';
import type { MuscleMapModel } from '@/features/profile/types';
import type { MuscleGroupId } from '../utils/muscleGroups';
import { BACK_REGION_PATHS, FRONT_REGION_PATHS, type RegionPath } from './muscleGroupPaths';
import { BODY_VIEWBOX, SILHOUETTE_PIECES } from './silhouettePaths';
import { SILHOUETTE_PIECES_MALE } from './silhouettePathsMale';

/**
 * Data-driven muscle map — hand-crafted organic silhouette and muscle-belly
 * shapes, ported from the web app's `<svg>`-based component to
 * `react-native-svg`'s `<Svg>/<Path>/<G>/<Defs>/<ClipPath>`. Front and back
 * share one silhouette; only the internal region highlights differ per
 * view. Region geometry is identical between the female and male
 * silhouettes — only the background body outline changes per `model`.
 */

export interface MuscleMapProps {
  /** 0-1 normalized training intensity per muscle group. Omitted/0 = not trained. */
  intensity: Partial<Record<MuscleGroupId, number>>;
  /** Caps how wide the pair grows on a tablet-width screen — on a phone, the two views always share the available width equally regardless of this. */
  size?: 'sm' | 'lg';
  model?: MuscleMapModel;
}

const SILHOUETTE_BY_MODEL: Record<MuscleMapModel, string[]> = {
  female: SILHOUETTE_PIECES,
  male: SILHOUETTE_PIECES_MALE,
};

const MAX_WIDTH = { sm: 220, lg: 300 } as const;

/** 0 → fully transparent (no highlight). Otherwise a 0.3-1.0 band so even "low" reads as mint, not noise. */
function opacityFor(value: number | undefined): number {
  const clamped = Math.min(1, Math.max(0, value ?? 0));
  return clamped <= 0 ? 0 : 0.3 + clamped * 0.7;
}

function RegionLayer({
  regions,
  intensity,
}: {
  regions: RegionPath[];
  intensity: Partial<Record<MuscleGroupId, number>>;
}) {
  return (
    <>
      {regions.map((region, index) => (
        <Path
          key={`${region.id}-${region.side}-${index}`}
          d={region.d}
          fill={colors.primary}
          fillOpacity={opacityFor(intensity[region.id])}
          stroke={colors.border}
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      ))}
    </>
  );
}

const [VIEWBOX_WIDTH, VIEWBOX_HEIGHT] = BODY_VIEWBOX.split(' ').slice(2).map(Number);
const BODY_ASPECT_RATIO = VIEWBOX_WIDTH / VIEWBOX_HEIGHT;

function BodyView({
  regions,
  intensity,
  label,
  maxWidth,
  silhouettePieces,
}: {
  regions: RegionPath[];
  intensity: Partial<Record<MuscleGroupId, number>>;
  label: string;
  maxWidth: number;
  silhouettePieces: string[];
}) {
  const clipId = useId();

  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 8 }}>
      <View style={{ width: '100%', maxWidth, aspectRatio: BODY_ASPECT_RATIO }}>
        <Svg width="100%" height="100%" viewBox={BODY_VIEWBOX}>
          <Defs>
            <ClipPath id={clipId}>
              {silhouettePieces.map((d, index) => (
                <Path key={index} d={d} />
              ))}
            </ClipPath>
          </Defs>
          {silhouettePieces.map((d, index) => (
            <Path key={index} d={d} fill={colors.muted} stroke={colors.border} strokeWidth={1.25} />
          ))}
          <G clipPath={`url(#${clipId})`}>
            <RegionLayer regions={regions} intensity={intensity} />
          </G>
        </Svg>
      </View>
      <Caption color="mutedForeground">{label}</Caption>
    </View>
  );
}

export function MuscleMap({ intensity, size = 'sm', model = 'female' }: MuscleMapProps) {
  const maxWidth = MAX_WIDTH[size];
  const silhouettePieces = SILHOUETTE_BY_MODEL[model];

  return (
    <View style={{ flexDirection: 'row', gap: 24 }}>
      <BodyView regions={FRONT_REGION_PATHS} intensity={intensity} label="Front" maxWidth={maxWidth} silhouettePieces={silhouettePieces} />
      <BodyView regions={BACK_REGION_PATHS} intensity={intensity} label="Back" maxWidth={maxWidth} silhouettePieces={silhouettePieces} />
    </View>
  );
}
