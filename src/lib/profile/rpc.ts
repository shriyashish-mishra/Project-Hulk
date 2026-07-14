import { cache } from "react";
import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type WeightLogRow = Database["public"]["Tables"]["weight_logs"]["Row"];

export interface UserContextRpcResult {
  profile: ProfileRow | null;
  latest_weight: WeightLogRow | null;
  period_starts: string[];
}

/**
 * Single source of truth for "everything the app needs to know about the
 * current user" — one Postgres round-trip (via the get_user_context RPC,
 * a SECURITY INVOKER function so RLS still applies exactly as if each
 * table were queried directly) instead of the 2-4 separate queries
 * (profile, latest weight, latest period log, all period logs) this used
 * to take. Cached per-request via React's cache(), so getProfile() and
 * getUserContext() — however many times either is called on a page —
 * share this one result instead of each re-querying.
 */
export const getUserContextRpc = cache(async (): Promise<UserContextRpcResult> => {
  const { supabase } = await requireUser();
  const { data, error } = await supabase.rpc("get_user_context");

  if (error) throw new Error(error.message);

  const result = data as unknown as UserContextRpcResult;
  return {
    profile: result?.profile ?? null,
    latest_weight: result?.latest_weight ?? null,
    period_starts: result?.period_starts ?? [],
  };
});
