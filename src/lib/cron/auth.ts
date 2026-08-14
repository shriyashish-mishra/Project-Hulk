import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { secureEquals } from "@/lib/security";

const BEARER_PREFIX = "Bearer ";

/**
 * Auth for Vercel Cron-triggered routes (`src/app/api/cron/*`). Vercel
 * automatically sends `Authorization: Bearer $CRON_SECRET` on every real
 * Cron Job invocation once `CRON_SECRET` is set as a project env var, so
 * checking it here is enough to keep the route from being triggered by
 * anyone else. Same single-user, service-role-backed pattern already used
 * for quick-log and the Todoist webhook — see `quick-log/auth.ts` for why
 * (this app has exactly one user). Returns null on any auth failure.
 */
export function requireCronAuth(
  request: Request,
): { supabase: ReturnType<typeof createSupabaseClient<Database>>; user: User } | null {
  const header = request.headers.get("Authorization");
  if (!header?.startsWith(BEARER_PREFIX)) return null;

  const token = header.slice(BEARER_PREFIX.length);
  if (!secureEquals(token, process.env.CRON_SECRET!)) return null;

  const supabase = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );

  return { supabase, user: { id: process.env.PROJECT_HULK_USER_ID! } as User };
}
