import type { PersonalRecords } from "@/lib/workout-sessions/exercise-progress";
import type { WeightUnit } from "@/lib/exercise-library/types";

function RecordTile({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-2xl border border-border bg-card p-3.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-lg font-semibold text-foreground">
        {value}
        {unit && <span className="text-xs font-normal text-muted-foreground"> {unit}</span>}
      </span>
    </div>
  );
}

interface PersonalRecordsRowProps {
  personalRecords: PersonalRecords;
  unit: WeightUnit;
}

/** Highest weight, most reps, and best single-session volume — three quick "best ever" numbers. */
export function PersonalRecordsRow({ personalRecords, unit }: PersonalRecordsRowProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-semibold text-foreground">Personal Records</h3>
      <div className="grid grid-cols-3 gap-3">
        <RecordTile label="Highest Weight" value={personalRecords.max_weight?.value ?? "—"} unit={personalRecords.max_weight?.unit} />
        <RecordTile label="Most Reps" value={personalRecords.max_reps?.value ?? "—"} />
        <RecordTile
          label="Highest Volume"
          value={personalRecords.max_volume?.value ?? "—"}
          unit={personalRecords.max_volume ? unit : undefined}
        />
      </div>
    </div>
  );
}
