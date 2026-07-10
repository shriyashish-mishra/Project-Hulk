import { Flag } from "lucide-react";

interface NextMonthMilestonesProps {
  milestones: string[];
}

export function NextMonthMilestones({ milestones }: NextMonthMilestonesProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {milestones.map((milestone, index) => (
        <li key={index} className="flex items-start gap-2.5 text-sm">
          <Flag className="mt-0.5 size-4 shrink-0 text-primary" />
          <span>{milestone}</span>
        </li>
      ))}
    </ul>
  );
}
