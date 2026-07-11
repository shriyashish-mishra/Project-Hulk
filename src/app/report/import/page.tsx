import { ImportReportForm } from "@/components/nightly-report/import-report-form";
import { requireOnboardedUser } from "@/lib/supabase/auth";

export default async function ImportReportPage() {
  await requireOnboardedUser();
  return <ImportReportForm />;
}
