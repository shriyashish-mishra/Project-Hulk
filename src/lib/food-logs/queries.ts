import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { FoodLog } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/** `ctx` lets callers outside a browser request (MCP, quick-log) inject an already-authenticated context instead of `requireUser()`. */
export async function getFoodLogsForDate(loggedOn: string, ctx?: AuthContext): Promise<FoodLog[]> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", user.id)
    .eq("logged_on", loggedOn)
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return data;
}
