import { useId } from "react";
import { cn } from "@/lib/utils";
import type { MuscleGroupId } from "@/lib/progress/muscle-groups";
import { BODY_VIEWBOX, SILHOUETTE_PIECES } from "./silhouette-paths";
import { BACK_REGION_PATHS, FRONT_REGION_PATHS, type RegionPath } from "./muscle-regions";

/**
 * Data-driven muscle map — hand-crafted organic silhouette and muscle-belly
 * shapes (smooth bezier curves throughout, no straight-edged polygons).
 * Front and back share one silhouette; only the internal region highlights
 * differ per view.
 */

export interface MuscleMapProps {
  /** 0-1 normalized training intensity per muscle group. Omitted/0 = not trained. */
  intensity: Partial<Record<MuscleGroupId, number>>;
  className?: string;
  size?: "sm" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-56",
  lg: "h-80",
} as const;

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
        <path
          key={`${region.id}-${region.side}-${index}`}
          d={region.d}
          fill="var(--primary)"
          fillOpacity={opacityFor(intensity[region.id])}
          stroke="var(--border)"
          strokeWidth={1}
          strokeOpacity={0.5}
        />
      ))}
    </>
  );
}

function BodyView({
  regions,
  intensity,
  label,
  heightClass,
}: {
  regions: RegionPath[];
  intensity: Partial<Record<MuscleGroupId, number>>;
  label: string;
  heightClass: string;
}) {
  const clipId = useId();

  return (
    <div className="flex flex-col items-center gap-2">
      <svg viewBox={BODY_VIEWBOX} className={cn(heightClass, "w-auto")}>
        <defs>
          <clipPath id={clipId}>
            {SILHOUETTE_PIECES.map((d, index) => (
              <path key={index} d={d} />
            ))}
          </clipPath>
        </defs>
        {SILHOUETTE_PIECES.map((d, index) => (
          <path key={index} d={d} fill="var(--muted)" stroke="var(--border)" strokeWidth={1.25} />
        ))}
        <g clipPath={`url(#${clipId})`}>
          <RegionLayer regions={regions} intensity={intensity} />
        </g>
      </svg>
      <span className="text-[11px] text-muted-foreground">{label}</span>
    </div>
  );
}

export function MuscleMap({ intensity, className, size = "sm" }: MuscleMapProps) {
  const heightClass = SIZE_CLASSES[size];

  return (
    <div className={cn("flex items-center justify-center gap-10", className)}>
      <BodyView regions={FRONT_REGION_PATHS} intensity={intensity} label="Front" heightClass={heightClass} />
      <BodyView regions={BACK_REGION_PATHS} intensity={intensity} label="Back" heightClass={heightClass} />
    </div>
  );
}
