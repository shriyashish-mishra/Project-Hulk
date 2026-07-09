import { Badge } from "@/components/ui/badge";
import type { MuscleGroupCount } from "@/lib/progress/types";

interface MuscleGroupsCardProps {
  counts: MuscleGroupCount[];
}

export function MuscleGroupsCard({ counts }: MuscleGroupsCardProps) {
  if (counts.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No workouts logged this week yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {counts.map(({ muscle, count }) => (
        <Badge key={muscle} variant="secondary">
          {muscle} {count > 1 && <span className="text-muted-foreground">×{count}</span>}
        </Badge>
      ))}
    </div>
  );
}
