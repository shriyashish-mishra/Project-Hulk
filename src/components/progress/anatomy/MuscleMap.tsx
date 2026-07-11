import { useId } from "react";
import { cn } from "@/lib/utils";
import type { MuscleGroupId } from "@/lib/progress/muscle-groups";
import {
  BACK_DECOR_PATHS,
  BACK_SILHOUETTE,
  BODY_VIEWBOX,
  FRONT_DECOR_PATHS,
  FRONT_SILHOUETTE,
} from "./silhouette-paths";
import { BACK_REGION_PATHS, FRONT_REGION_PATHS, type RegionPath } from "./muscle-regions";

/**
 * Data-driven muscle map built on the approved asset pack's exact geometry
 * (silhouette-paths.ts — copied verbatim, never redrawn). Region boundaries
 * (muscle-regions.ts) were traced against the reference art, not invented,
 * and are clipped to the exact silhouette so tracing tolerance never draws
 * outside the approved outline.
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
          strokeWidth={0.75}
          strokeOpacity={0.55}
        />
      ))}
    </>
  );
}

function BodyView({
  silhouette,
  decor,
  regions,
  intensity,
  label,
  heightClass,
}: {
  silhouette: string;
  decor: string[];
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
            <path d={silhouette} />
          </clipPath>
        </defs>
        <path d={silhouette} fill="var(--muted)" stroke="var(--border)" strokeWidth={1} />
        {decor.map((d, index) => (
          <path
            key={index}
            d={d}
            fill="var(--muted)"
            stroke="var(--border)"
            strokeWidth={0.75}
            opacity={0.7}
          />
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
      <BodyView
        silhouette={FRONT_SILHOUETTE}
        decor={FRONT_DECOR_PATHS}
        regions={FRONT_REGION_PATHS}
        intensity={intensity}
        label="Front"
        heightClass={heightClass}
      />
      <BodyView
        silhouette={BACK_SILHOUETTE}
        decor={BACK_DECOR_PATHS}
        regions={BACK_REGION_PATHS}
        intensity={intensity}
        label="Back"
        heightClass={heightClass}
      />
    </div>
  );
}
