import { Check, TriangleAlert } from "lucide-react";
import type { MonthlyReflection as MonthlyReflectionData } from "@/lib/progress/stats";

function Subsection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </span>
      {children}
    </div>
  );
}

interface MonthlyReflectionListsProps {
  reflection: MonthlyReflectionData;
}

export function MonthlyReflectionLists({ reflection }: MonthlyReflectionListsProps) {
  return (
    <div className="flex flex-col gap-5">
      <Subsection label="Achievements">
        {reflection.achievements.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {reflection.achievements.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 size-4 shrink-0 text-success" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">
            Keep logging to unlock achievements.
          </p>
        )}
      </Subsection>

      <Subsection label="Areas to Improve">
        {reflection.areasToImprove.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {reflection.areasToImprove.map((item, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Nothing flagged — solid month.</p>
        )}
      </Subsection>
    </div>
  );
}
