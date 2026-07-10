import type { WeeklyRoadmap } from "@/lib/progress/weekly-plan";

function RoadmapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

interface RoadmapCardProps {
  roadmap: WeeklyRoadmap;
}

export function RoadmapCard({ roadmap }: RoadmapCardProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <p className="mb-2 text-sm text-muted-foreground">{roadmap.coachNote}</p>
        <div className="flex flex-col divide-y divide-border">
          <RoadmapRow label="Primary Focus" value={roadmap.primaryFocus} />
          <RoadmapRow label="Secondary Focus" value={roadmap.secondaryFocus} />
          <RoadmapRow label="Suggested Split" value={roadmap.suggestedSplit} />
          <RoadmapRow label="Recovery Advice" value={roadmap.recoveryAdvice} />
          <RoadmapRow label="Protein Goal" value={`${roadmap.proteinGoalG}g / day`} />
          <RoadmapRow label="Cardio Goal" value={roadmap.cardioGoal} />
          <RoadmapRow label="Mobility Goal" value={roadmap.mobilityGoal} />
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Suggested Schedule
        </span>
        <ul className="flex flex-col divide-y divide-border">
          {roadmap.schedule.map((planned) => (
            <li key={planned.day} className="flex flex-col gap-1 py-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-sm font-medium text-foreground">{planned.day}</span>
                <span className="text-xs text-muted-foreground">{planned.focus}</span>
              </div>
              {planned.exercises.length > 0 ? (
                <ul className="flex flex-col gap-0.5">
                  {planned.exercises.map((exercise) => (
                    <li key={exercise} className="text-xs text-muted-foreground">
                      {exercise}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Let the week&rsquo;s work absorb.
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
