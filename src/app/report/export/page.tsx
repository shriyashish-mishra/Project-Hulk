import { BackLink } from "@/components/ui/back-link";
import { ExportReportsForm } from "@/components/nightly-report/export-reports-form";
import { getDaysAgoDateString } from "@/lib/date";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const DEFAULT_RANGE_DAYS = 30;

export default async function ExportReportsPage() {
  await requireOnboardedUser();
  const defaultStart = getDaysAgoDateString(DEFAULT_RANGE_DAYS);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <BackLink href="/more" />
        <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground">
          Export Reports
        </h1>
        <p className="text-sm text-muted-foreground">
          Download your coach reports as a spreadsheet, for any date range.
        </p>
      </div>

      <ExportReportsForm defaultStart={defaultStart} />
    </div>
  );
}
