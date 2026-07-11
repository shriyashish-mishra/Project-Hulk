import { LogPickerForm } from "@/components/log/log-picker-form";
import { requireOnboardedUser } from "@/lib/supabase/auth";

export default async function LogPickerPage() {
  await requireOnboardedUser();
  return <LogPickerForm />;
}
