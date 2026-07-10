import { cn } from "@/lib/utils";
import type { MuscleRegion } from "@/lib/progress/muscle-map";

interface RegionShape {
  region: MuscleRegion;
  kind: "circle" | "rect";
  cx?: number;
  cy?: number;
  r?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  rx?: number;
}

const FRONT_SHAPES: RegionShape[] = [
  { region: "shoulders", kind: "circle", cx: 32, cy: 40, r: 7 },
  { region: "shoulders", kind: "circle", cx: 68, cy: 40, r: 7 },
  { region: "chest", kind: "rect", x: 38, y: 42, width: 24, height: 15, rx: 6 },
  { region: "core", kind: "rect", x: 41, y: 59, width: 18, height: 26, rx: 6 },
  { region: "arms", kind: "rect", x: 21, y: 42, width: 10, height: 28, rx: 5 },
  { region: "arms", kind: "rect", x: 69, y: 42, width: 10, height: 28, rx: 5 },
  { region: "quadriceps", kind: "rect", x: 36, y: 112, width: 12, height: 45, rx: 6 },
  { region: "quadriceps", kind: "rect", x: 52, y: 112, width: 12, height: 45, rx: 6 },
  { region: "calves", kind: "rect", x: 37, y: 160, width: 9, height: 35, rx: 4 },
  { region: "calves", kind: "rect", x: 54, y: 160, width: 9, height: 35, rx: 4 },
];

const BACK_SHAPES: RegionShape[] = [
  { region: "shoulders", kind: "circle", cx: 32, cy: 40, r: 7 },
  { region: "shoulders", kind: "circle", cx: 68, cy: 40, r: 7 },
  { region: "back", kind: "rect", x: 37, y: 42, width: 26, height: 42, rx: 8 },
  { region: "arms", kind: "rect", x: 21, y: 42, width: 10, height: 28, rx: 5 },
  { region: "arms", kind: "rect", x: 69, y: 42, width: 10, height: 28, rx: 5 },
  { region: "glutes", kind: "rect", x: 37, y: 108, width: 26, height: 20, rx: 8 },
  { region: "hamstrings", kind: "rect", x: 36, y: 130, width: 12, height: 30, rx: 6 },
  { region: "hamstrings", kind: "rect", x: 52, y: 130, width: 12, height: 30, rx: 6 },
  { region: "calves", kind: "rect", x: 37, y: 160, width: 9, height: 35, rx: 4 },
  { region: "calves", kind: "rect", x: 54, y: 160, width: 9, height: 35, rx: 4 },
];

/** A soft, minimal female silhouette — abstract rounded shapes, not literal anatomy. */
function Outline() {
  return (
    <g fill="none" stroke="var(--border)" strokeWidth={1.5} strokeLinecap="round">
      <circle cx={50} cy={16} r={10} />
      <line x1={50} y1={26} x2={50} y2={34} />
      <path d="M33,36 L41,70 L32,108 L68,108 L59,70 L67,36" strokeLinejoin="round" />
      <line x1={33} y1={38} x2={20} y2={99} />
      <line x1={67} y1={38} x2={80} y2={99} />
      <line x1={42} y1={108} x2={42} y2={195} />
      <line x1={58} y1={108} x2={58} y2={195} />
      <line x1={42} y1={195} x2={37} y2={207} />
      <line x1={58} y1={195} x2={63} y2={207} />
    </g>
  );
}

function RegionShapes({
  shapes,
  regionCounts,
  maxCount,
}: {
  shapes: RegionShape[];
  regionCounts: Map<MuscleRegion, number>;
  maxCount: number;
}) {
  return (
    <>
      {shapes.map((shape, index) => {
        const count = regionCounts.get(shape.region) ?? 0;
        const trained = count > 0;
        const opacity = trained
          ? Math.min(0.4 + (count / Math.max(maxCount, 1)) * 0.5, 0.95)
          : 1;
        const fill = trained ? "var(--primary)" : "var(--muted)";

        if (shape.kind === "circle") {
          return (
            <circle
              key={index}
              cx={shape.cx}
              cy={shape.cy}
              r={shape.r}
              fill={fill}
              opacity={opacity}
            />
          );
        }
        return (
          <rect
            key={index}
            x={shape.x}
            y={shape.y}
            width={shape.width}
            height={shape.height}
            rx={shape.rx}
            fill={fill}
            opacity={opacity}
          />
        );
      })}
    </>
  );
}

interface MuscleMapFigureProps {
  regionCounts: Map<MuscleRegion, number>;
  className?: string;
  size?: "sm" | "lg";
}

const SIZE_CLASSES = {
  sm: "h-48",
  lg: "h-72",
} as const;

export function MuscleMapFigure({
  regionCounts,
  className,
  size = "sm",
}: MuscleMapFigureProps) {
  const maxCount = Math.max(1, ...Array.from(regionCounts.values()));
  const heightClass = SIZE_CLASSES[size];

  return (
    <div className={cn("flex items-center justify-center gap-8", className)}>
      <div className="flex flex-col items-center gap-1.5">
        <svg viewBox="0 0 100 215" className={cn(heightClass, "w-auto")}>
          <Outline />
          <RegionShapes shapes={FRONT_SHAPES} regionCounts={regionCounts} maxCount={maxCount} />
        </svg>
        <span className="text-[11px] text-muted-foreground">Front</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <svg viewBox="0 0 100 215" className={cn(heightClass, "w-auto")}>
          <Outline />
          <RegionShapes shapes={BACK_SHAPES} regionCounts={regionCounts} maxCount={maxCount} />
        </svg>
        <span className="text-[11px] text-muted-foreground">Back</span>
      </div>
    </div>
  );
}
