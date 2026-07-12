import { ImportReportForm } from "@/components/nightly-report/import-report-form";
import { getLocalDateString } from "@/lib/date";
import { requireOnboardedUser } from "@/lib/supabase/auth";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface ImportReportPageProps {
  searchParams: Promise<{ date?: string }>;
}

export default async function ImportReportPage({ searchParams }: ImportReportPageProps) {
  await requireOnboardedUser();
  const { date: dateParam } = await searchParams;
  const today = getLocalDateString();
  const initialDate =
    dateParam && DATE_PATTERN.test(dateParam) && dateParam <= today ? dateParam : undefined;

  return <ImportReportForm initialDate={initialDate} />;
}
