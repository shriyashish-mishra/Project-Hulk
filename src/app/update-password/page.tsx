import { UpdatePasswordForm } from "@/components/auth/update-password-form";
import { requireUser } from "@/lib/supabase/auth";

/** Plain requireUser(), not requireOnboardedUser() — a pre-onboarding user must be able to reset their password too. */
export default async function UpdatePasswordPage() {
  await requireUser();
  return <UpdatePasswordForm />;
}
