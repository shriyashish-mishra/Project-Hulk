import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectableCardProps {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}

/** Single-select choice card — reused across onboarding and Profile edit drawers. */
export function SelectableCard({ label, description, selected, onSelect }: SelectableCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3.5 rounded-2xl border px-4 py-3.5 text-left transition-colors active:opacity-80",
        selected ? "border-primary bg-primary/10" : "border-border bg-card",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold text-foreground">{label}</p>
        {description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {selected && <Check className="size-3.5" strokeWidth={3} />}
      </span>
    </button>
  );
}
