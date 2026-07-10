import { Check, TriangleAlert } from "lucide-react";

interface CoachFeedbackListProps {
  strengths: string[];
  improvements: string[];
}

function FeedbackSection({
  label,
  items,
  icon: Icon,
  iconClass,
}: {
  label: string;
  items: string[];
  icon: typeof Check;
  iconClass: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold tracking-[0.08em] text-muted-foreground uppercase">
        {label}
      </span>
      <ul className="flex flex-col gap-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <Icon className={`mt-0.5 size-4 shrink-0 ${iconClass}`} />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CoachFeedbackList({ strengths, improvements }: CoachFeedbackListProps) {
  return (
    <div className="flex flex-col gap-5">
      <FeedbackSection
        label="What Went Well"
        items={strengths}
        icon={Check}
        iconClass="text-success"
      />
      <FeedbackSection
        label="What Could Improve"
        items={improvements}
        icon={TriangleAlert}
        iconClass="text-warning"
      />
    </div>
  );
}
