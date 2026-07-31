import { requireUser } from "@/lib/supabase/auth";
import type { Database } from "@/lib/supabase/database.types";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { ExerciseLibraryItem } from "./types";

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/** Same six exercises worked through in the mobile app's example, plus the machine exercises already corrected to lbs in historical reports (see scripts/fix-machine-exercise-units.mjs) — kept consistent so a fresh template defaults to the same unit. */
const DEFAULT_EXERCISES: Array<Pick<ExerciseLibraryItem, "name" | "category" | "default_unit">> = [
  { name: "Bicep Curls", category: "strength", default_unit: "kg" },
  { name: "Hammer Curls", category: "strength", default_unit: "kg" },
  { name: "Lat Pulldown", category: "strength", default_unit: "lbs" },
  { name: "Machine Row", category: "strength", default_unit: "lbs" },
  { name: "Face Pull", category: "strength", default_unit: "lbs" },
  { name: "Tricep Pushdown", category: "strength", default_unit: "lbs" },
  { name: "Incline Walk", category: "cardio", default_unit: "kg" },
];

/**
 * Lazily seeds a fresh account's exercise library the first time it's
 * empty. A Postgres migration can't know a user's id ahead of time (unlike
 * the mobile app's single-user SQLite database, which seeds this directly
 * in the migration itself), so this is the web equivalent: seed on first
 * read instead of at schema-creation time.
 */
async function seedDefaultExercises(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<ExerciseLibraryItem[]> {
  const { data, error } = await supabase
    .from("exercise_library")
    .insert(DEFAULT_EXERCISES.map((exercise) => ({ ...exercise, user_id: userId })))
    .select();

  if (error) throw new Error(error.message);
  return (data as ExerciseLibraryItem[]).sort((a, b) => a.name.localeCompare(b.name));
}

/** `ctx` lets callers outside a browser request inject an already-authenticated context instead of `requireUser()`, same pattern as workout-logs/queries.ts. */
export async function getExerciseLibrary(ctx?: AuthContext): Promise<ExerciseLibraryItem[]> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("exercise_library")
    .select("*")
    .eq("user_id", user.id)
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  if (data.length === 0) {
    return seedDefaultExercises(supabase, user.id);
  }
  return data as ExerciseLibraryItem[];
}

/** Batches a lookup of several exercises by id into one query — used wherever a list of template/session rows needs each one's name and category joined in. */
export async function getExercisesByIds(
  ids: string[],
  ctx?: AuthContext,
): Promise<Map<string, ExerciseLibraryItem>> {
  if (ids.length === 0) return new Map();

  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("exercise_library")
    .select("*")
    .eq("user_id", user.id)
    .in("id", ids);

  if (error) throw new Error(error.message);
  return new Map((data as ExerciseLibraryItem[]).map((item) => [item.id, item]));
}

export async function findExerciseByName(
  name: string,
  ctx?: AuthContext,
): Promise<ExerciseLibraryItem | null> {
  const { supabase, user } = ctx ?? (await requireUser());
  const { data, error } = await supabase
    .from("exercise_library")
    .select("*")
    .eq("user_id", user.id)
    .ilike("name", name.trim())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as ExerciseLibraryItem | null;
}
