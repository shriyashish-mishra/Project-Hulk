import { cn } from "@/lib/utils";
import type { MuscleRegion } from "@/lib/progress/muscle-map";

interface RegionShape {
  region: MuscleRegion;
  kind: "ellipse" | "path";
  cx?: number;
  cy?: number;
  rx?: number;
  ry?: number;
  d?: string;
}

const FRONT_SHAPES: RegionShape[] = [
  { region: "shoulders", kind: "ellipse", cx: 27, cy: 34, rx: 6, ry: 6.5 },
  { region: "shoulders", kind: "ellipse", cx: 73, cy: 34, rx: 6, ry: 6.5 },
  { region: "chest", kind: "ellipse", cx: 41, cy: 43, rx: 9.5, ry: 7 },
  { region: "chest", kind: "ellipse", cx: 59, cy: 43, rx: 9.5, ry: 7 },
  { region: "core", kind: "path", d: "M41,44 L59,44 L60,64 L58,80 L42,80 L40,64 Z" },
  {
    region: "arms",
    kind: "path",
    d: "M25,35 Q16,55 15,75 Q15,88 18,96 L24,96 Q22,84 23,70 Q24,52 30,37 Z",
  },
  {
    region: "arms",
    kind: "path",
    d: "M75,35 Q84,55 85,75 Q85,88 82,96 L76,96 Q78,84 77,70 Q76,52 70,37 Z",
  },
  { region: "quadriceps", kind: "path", d: "M31,101 L48,101 L46,150 L34,150 Z" },
  { region: "quadriceps", kind: "path", d: "M69,101 L52,101 L54,150 L66,150 Z" },
  { region: "calves", kind: "path", d: "M35,152 L47,152 L45,192 L37,192 Z" },
  { region: "calves", kind: "path", d: "M65,152 L53,152 L55,192 L63,192 Z" },
];

const BACK_SHAPES: RegionShape[] = [
  { region: "shoulders", kind: "ellipse", cx: 27, cy: 34, rx: 6, ry: 6.5 },
  { region: "shoulders", kind: "ellipse", cx: 73, cy: 34, rx: 6, ry: 6.5 },
  { region: "back", kind: "path", d: "M33,37 L67,37 L60,68 L50,74 L40,68 Z" },
  {
    region: "arms",
    kind: "path",
    d: "M25,35 Q16,55 15,75 Q15,88 18,96 L24,96 Q22,84 23,70 Q24,52 30,37 Z",
  },
  {
    region: "arms",
    kind: "path",
    d: "M75,35 Q84,55 85,75 Q85,88 82,96 L76,96 Q78,84 77,70 Q76,52 70,37 Z",
  },
  { region: "glutes", kind: "ellipse", cx: 40, cy: 107, rx: 10, ry: 9 },
  { region: "glutes", kind: "ellipse", cx: 60, cy: 107, rx: 10, ry: 9 },
  { region: "hamstrings", kind: "path", d: "M31,119 L48,119 L46,150 L34,150 Z" },
  { region: "hamstrings", kind: "path", d: "M69,119 L52,119 L54,150 L66,150 Z" },
  { region: "calves", kind: "path", d: "M35,152 L47,152 L45,192 L37,192 Z" },
  { region: "calves", kind: "path", d: "M65,152 L53,152 L55,192 L63,192 Z" },
];

/** Soft, minimal female silhouette with light anatomical definition lines — not literal anatomy. */
function Outline({ variant }: { variant: "front" | "back" }) {
  return (
    <g stroke="var(--border)" strokeWidth={1.4} strokeLinecap="round" fill="none">
      <circle cx={50} cy={13} r={9} />
      <line x1={50} y1={22} x2={50} y2={30} />
      <path d="M28,32 L39,62 L30,100 L70,100 L61,62 L72,32" strokeLinejoin="round" />
      <path d="M25,35 Q16,55 15,75 Q15,88 18,96" />
      <path d="M75,35 Q84,55 85,75 Q85,88 82,96" />
      <path d="M40,100 L38,150 L37,192" />
      <path d="M60,100 L62,150 L63,192" />
      <path d="M37,192 L32,205" />
      <path d="M63,192 L68,205" />
      {variant === "front" ? (
        <g strokeWidth={1} opacity={0.6}>
          <line x1={50} y1={44} x2={50} y2={78} />
          <line x1={41} y1={54} x2={59} y2={54} />
          <line x1={42} y1={66} x2={58} y2={66} />
        </g>
      ) : (
        <g strokeWidth={1} opacity={0.6}>
          <line x1={50} y1={38} x2={50} y2={70} />
        </g>
      )}
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

        if (shape.kind === "ellipse") {
          return (
            <ellipse
              key={index}
              cx={shape.cx}
              cy={shape.cy}
              rx={shape.rx}
              ry={shape.ry}
              fill={fill}
              opacity={opacity}
            />
          );
        }
        return <path key={index} d={shape.d} fill={fill} opacity={opacity} />;
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
        <svg viewBox="0 0 100 212" className={cn(heightClass, "w-auto")}>
          <RegionShapes shapes={FRONT_SHAPES} regionCounts={regionCounts} maxCount={maxCount} />
          <Outline variant="front" />
        </svg>
        <span className="text-[11px] text-muted-foreground">Front</span>
      </div>
      <div className="flex flex-col items-center gap-1.5">
        <svg viewBox="0 0 100 212" className={cn(heightClass, "w-auto")}>
          <RegionShapes shapes={BACK_SHAPES} regionCounts={regionCounts} maxCount={maxCount} />
          <Outline variant="back" />
        </svg>
        <span className="text-[11px] text-muted-foreground">Back</span>
      </div>
    </div>
  );
}
