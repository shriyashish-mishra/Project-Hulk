import type { WeeklyPlan } from "@/lib/progress/weekly-plan";

interface WeeklyPlanCardProps {
  plan: WeeklyPlan;
}

export function WeeklyPlanCard({ plan }: WeeklyPlanCardProps) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">{plan.coachNote}</p>

      <div className="flex items-center justify-between rounded-2xl bg-muted p-3.5">
        <span className="text-xs text-muted-foreground">Protein goal</span>
        <span className="text-lg font-semibold text-foreground">
          {plan.proteinGoalG}
          <span className="ml-0.5 text-xs font-normal text-muted-foreground">
            g / day
          </span>
        </span>
      </div>

      <ul className="flex flex-col divide-y divide-border">
        {plan.days.map((day) => (
          <li key={day.day} className="flex flex-col gap-1 py-2.5">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{day.day}</span>
              <span className="text-xs text-muted-foreground">{day.focus}</span>
            </div>
            {day.exercises.length > 0 ? (
              <ul className="flex flex-col gap-0.5">
                {day.exercises.map((exercise) => (
                  <li key={exercise} className="text-xs text-muted-foreground">
                    {exercise}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-muted-foreground">
                Full rest — let the week&rsquo;s work absorb.
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
