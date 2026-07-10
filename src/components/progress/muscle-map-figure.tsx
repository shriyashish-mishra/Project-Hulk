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
  { region: "shoulders", kind: "circle", cx: 30, cy: 40, r: 8 },
  { region: "shoulders", kind: "circle", cx: 70, cy: 40, r: 8 },
  { region: "chest", kind: "rect", x: 36, y: 42, width: 28, height: 16, rx: 6 },
  { region: "core", kind: "rect", x: 39, y: 60, width: 22, height: 28, rx: 6 },
  { region: "arms", kind: "rect", x: 20, y: 42, width: 11, height: 30, rx: 5 },
  { region: "arms", kind: "rect", x: 69, y: 42, width: 11, height: 30, rx: 5 },
  { region: "quadriceps", kind: "rect", x: 35, y: 112, width: 13, height: 45, rx: 6 },
  { region: "quadriceps", kind: "rect", x: 52, y: 112, width: 13, height: 45, rx: 6 },
  { region: "calves", kind: "rect", x: 36, y: 160, width: 10, height: 35, rx: 5 },
  { region: "calves", kind: "rect", x: 54, y: 160, width: 10, height: 35, rx: 5 },
];

const BACK_SHAPES: RegionShape[] = [
  { region: "shoulders", kind: "circle", cx: 30, cy: 40, r: 8 },
  { region: "shoulders", kind: "circle", cx: 70, cy: 40, r: 8 },
  { region: "back", kind: "rect", x: 35, y: 42, width: 30, height: 44, rx: 8 },
  { region: "arms", kind: "rect", x: 20, y: 42, width: 11, height: 30, rx: 5 },
  { region: "arms", kind: "rect", x: 69, y: 42, width: 11, height: 30, rx: 5 },
  { region: "glutes", kind: "rect", x: 36, y: 108, width: 28, height: 20, rx: 8 },
  { region: "hamstrings", kind: "rect", x: 35, y: 130, width: 13, height: 30, rx: 6 },
  { region: "hamstrings", kind: "rect", x: 52, y: 130, width: 13, height: 30, rx: 6 },
  { region: "calves", kind: "rect", x: 36, y: 160, width: 10, height: 35, rx: 5 },
  { region: "calves", kind: "rect", x: 54, y: 160, width: 10, height: 35, rx: 5 },
];

function Outline() {
  return (
    <g fill="none" stroke="var(--border)" strokeWidth={1.5} strokeLinecap="round">
      <circle cx={50} cy={16} r={11} />
      <line x1={50} y1={27} x2={50} y2={34} />
      <path d="M30,36 L38,88 L33,108 L67,108 L62,88 L70,36" />
      <line x1={30} y1={38} x2={17} y2={100} />
      <line x1={70} y1={38} x2={83} y2={100} />
      <line x1={40} y1={108} x2={40} y2={195} />
      <line x1={60} y1={108} x2={60} y2={195} />
      <line x1={40} y1={195} x2={34} y2={207} />
      <line x1={60} y1={195} x2={66} y2={207} />
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
}

export function MuscleMapFigure({ regionCounts, className }: MuscleMapFigureProps) {
  const maxCount = Math.max(1, ...Array.from(regionCounts.values()));

  return (
    <div className={cn("flex items-center justify-center gap-6", className)}>
      <div className="flex flex-col items-center gap-1.5">
        <svg viewBox="0 0 100 215" className="h-48 w-auto">
          <Outline />
          <RegionShapes shapes={FRONT_SHAPES} regionCounts={regionCounts} maxCount={maxCount} />
        </svg>
        <span className="text-[11px] text-muted-foreground">Front</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <svg viewBox="0 0 100 215" className="h-48 w-auto">
          <Outline />
          <RegionShapes shapes={BACK_SHAPES} regionCounts={regionCounts} maxCount={maxCount} />
        </svg>
        <span className="text-[11px] text-muted-foreground">Back</span>
      </div>
    </div>
  );
}
