// One-time cloud → local migration: pulls this user's data out of the
// production Supabase database and reshapes it into the exact JSON
// format the mobile app's own "Import Data" feature already reads
// (mobile/src/core/backup/importBackup.ts) — no new mobile-side code
// needed, this script's whole job is producing a compatible payload.
//
// Deliberately narrower than "every table": web and mobile evolved
// several features independently and their schemas don't line up
// 1:1 everywhere. What's included vs. skipped, and why:
//
//   INCLUDED (schemas map cleanly):
//     food_logs, workout_logs, weight_logs                  — near-identical shape
//     water_logs        -> water_entries + water_goals       — web's mutable daily total
//                                                               becomes one consolidated entry
//     sleep_logs                                             — date/duration map directly;
//                                                               web has no bedtime/wake/quality,
//                                                               mobile has no target_minutes
//     period_logs        -> cycle_logs (+ cycle_settings)    — direct field rename
//     exercise_library, workout_templates, template_exercises,
//     workout_sessions, workout_session_exercises            — identical shape minus user_id
//
//   SKIPPED (no compatible destination — not a bug, a real gap):
//     daily_ai_reports  — mobile's ai_reports table tracks different score
//                          dimensions (nutrition/activity/recovery vs. web's
//                          nutrition/overall/workout) and a differently-shaped
//                          parsed result; migrating history here would mean
//                          inventing numbers, not moving real data. This is
//                          the AI-report-parity work called out separately.
//     progress_photos   — image files live in Supabase Storage; a JSON/
//                          clipboard payload can't carry binary images.
//     profiles          — mobile has no profile/onboarding table at all yet.
//     food_presets, workout_presets — mobile has no saved-presets table yet.
//
// All ids are re-issued as sequential integers (mobile's schema uses
// INTEGER PRIMARY KEY AUTOINCREMENT, not uuid) — every foreign key
// reference is rewritten alongside its row so relationships survive the
// id-type change.
//
// Usage:
//   node --env-file=.env.local scripts/export-cloud-data-for-mobile.mjs
//
// Writes scripts/output/cloud-export-for-mobile.json — see that file's
// own printed instructions for getting its contents onto your phone.

import { createClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUTPUT_PATH = path.join(process.cwd(), "scripts", "output", "cloud-export-for-mobile.json");

/** Assigns fresh sequential ids per table, and lets callers look up "what did this uuid become" while building FK-referencing rows in later tables. */
function createIdRemapper() {
  let nextId = 1;
  const map = new Map();
  return {
    assign(uuid) {
      const id = nextId++;
      map.set(uuid, id);
      return id;
    },
    has(uuid) {
      return map.has(uuid);
    },
    lookup(uuid) {
      const id = map.get(uuid);
      if (id === undefined) throw new Error(`No remapped id for ${uuid} — check table processing order.`);
      return id;
    },
  };
}

async function fetchAll(supabase, table, userId, orderColumn = "created_at") {
  const { data, error } = await supabase.from(table).select("*").eq("user_id", userId).order(orderColumn);
  if (error) throw new Error(`${table}: ${error.message}`);
  return data;
}

function mapFoodLogs(rows, remap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    meal_type: row.meal_type,
    raw_text: row.raw_text,
    logged_on: row.logged_on,
    created_at: row.created_at,
  }));
}

function mapWorkoutLogs(rows, remap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    raw_text: row.raw_text,
    logged_on: row.logged_on,
    workout_type: null,
    duration_minutes: null,
    created_at: row.created_at,
  }));
}

function mapWeightLogs(rows, remap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    measured_on: row.measured_on,
    weight_kg: row.weight_kg,
    created_at: row.created_at,
  }));
}

/** Web tracks one mutable glass_count per day; mobile tracks an append-only log of additions plus a separate goal. One web row becomes one consolidated water_entries row (skipped if nothing was logged that day) and one water_goals row. */
function mapWaterLogs(rows, waterEntryRemap, waterGoalRemap) {
  const entries = [];
  const goals = [];
  for (const row of rows) {
    if (row.glass_count > 0) {
      entries.push({
        id: waterEntryRemap.assign(row.id),
        entry_date: row.date,
        amount_ml: row.glass_count * row.glass_size_ml,
        created_at: row.created_at,
      });
    }
    goals.push({
      id: waterGoalRemap.assign(`${row.id}-goal`),
      entry_date: row.date,
      goal_ml: row.target_glasses * row.glass_size_ml,
      updated_at: row.updated_at,
    });
  }
  return { entries, goals };
}

function mapSleepLogs(rows, remap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    logged_on: row.date,
    bedtime: null,
    wake_time: null,
    duration_minutes: row.duration_minutes,
    quality: null,
    created_at: row.created_at,
  }));
}

function mapPeriodLogs(rows, remap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    start_date: row.started_on,
    end_date: row.ended_on,
    created_at: row.created_at,
  }));
}

function mapExerciseLibrary(rows, remap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    name: row.name,
    category: row.category,
    default_unit: row.default_unit,
    created_at: row.created_at,
  }));
}

function mapWorkoutTemplates(rows, remap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    name: row.name,
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

function mapTemplateExercises(rows, remap, templateRemap, exerciseRemap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    template_id: templateRemap.lookup(row.template_id),
    exercise_id: exerciseRemap.lookup(row.exercise_id),
    position: row.position,
    default_sets: row.default_sets,
    default_reps: row.default_reps,
    default_weight: row.default_weight,
    default_weight_unit: row.default_weight_unit,
    default_rest_seconds: row.default_rest_seconds,
    default_duration_minutes: row.default_duration_minutes,
    default_incline_percent: row.default_incline_percent,
    default_speed_kph: row.default_speed_kph,
    notes: row.notes,
  }));
}

function mapWorkoutSessions(rows, remap, templateRemap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    // template_id may point at a template that itself wasn't migrated
    // (deleted since, or owned by another user under RLS) — null rather
    // than throwing, since the session's own snapshot fields are self-sufficient.
    template_id: row.template_id && templateRemap.has(row.template_id) ? templateRemap.lookup(row.template_id) : null,
    template_name_snapshot: row.template_name_snapshot,
    logged_on: row.logged_on,
    started_at: row.started_at,
    completed_at: row.completed_at,
    total_calories: row.total_calories,
    created_at: row.created_at,
  }));
}

function mapWorkoutSessionExercises(rows, remap, sessionRemap, exerciseRemap) {
  return rows.map((row) => ({
    id: remap.assign(row.id),
    session_id: sessionRemap.lookup(row.session_id),
    exercise_id: exerciseRemap.lookup(row.exercise_id),
    position: row.position,
    sets_planned: row.sets_planned,
    sets_completed: row.sets_completed,
    reps: row.reps,
    weight: row.weight,
    weight_unit: row.weight_unit,
    duration_minutes: row.duration_minutes,
    incline_percent: row.incline_percent,
    speed_kph: row.speed_kph,
    notes: row.notes,
  }));
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.PROJECT_HULK_USER_ID;

  if (!url || !serviceRoleKey || !userId) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or PROJECT_HULK_USER_ID. Run with: node --env-file=.env.local scripts/export-cloud-data-for-mobile.mjs",
    );
  }

  const supabase = createClient(url, serviceRoleKey);

  const [
    foodLogs,
    workoutLogs,
    weightLogs,
    waterLogs,
    sleepLogs,
    periodLogs,
    profile,
    exerciseLibraryRows,
    workoutTemplateRows,
    templateExerciseRows,
    workoutSessionRows,
    workoutSessionExerciseRows,
  ] = await Promise.all([
    fetchAll(supabase, "food_logs", userId, "logged_on"),
    fetchAll(supabase, "workout_logs", userId, "logged_on"),
    fetchAll(supabase, "weight_logs", userId, "measured_on"),
    fetchAll(supabase, "water_logs", userId, "date"),
    fetchAll(supabase, "sleep_logs", userId, "date"),
    fetchAll(supabase, "period_logs", userId, "started_on"),
    supabase.from("profiles").select("biological_sex").eq("id", userId).maybeSingle().then(({ data, error }) => {
      if (error) throw new Error(`profiles: ${error.message}`);
      return data;
    }),
    fetchAll(supabase, "exercise_library", userId, "name"),
    fetchAll(supabase, "workout_templates", userId, "created_at"),
    fetchAll(supabase, "template_exercises", userId, "position"),
    fetchAll(supabase, "workout_sessions", userId, "started_at"),
    fetchAll(supabase, "workout_session_exercises", userId, "position"),
  ]);

  const foodRemap = createIdRemapper();
  const workoutLogRemap = createIdRemapper();
  const weightRemap = createIdRemapper();
  const waterEntryRemap = createIdRemapper();
  const waterGoalRemap = createIdRemapper();
  const sleepRemap = createIdRemapper();
  const cycleLogRemap = createIdRemapper();
  const exerciseRemap = createIdRemapper();
  const templateRemap = createIdRemapper();
  const templateExerciseRemap = createIdRemapper();
  const sessionRemap = createIdRemapper();
  const sessionExerciseRemap = createIdRemapper();

  const { entries: waterEntries, goals: waterGoals } = mapWaterLogs(waterLogs, waterEntryRemap, waterGoalRemap);
  const cycleLogs = mapPeriodLogs(periodLogs, cycleLogRemap);
  const cycleEnabled = profile?.biological_sex === "female" || cycleLogs.length > 0 ? 1 : 0;

  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    tables: {
      food_logs: mapFoodLogs(foodLogs, foodRemap),
      workout_logs: mapWorkoutLogs(workoutLogs, workoutLogRemap),
      weight_logs: mapWeightLogs(weightLogs, weightRemap),
      water_entries: waterEntries,
      water_goals: waterGoals,
      sleep_logs: mapSleepLogs(sleepLogs, sleepRemap),
      cycle_settings: [{ id: 1, enabled: cycleEnabled }],
      cycle_logs: cycleLogs,
      exercise_library: mapExerciseLibrary(exerciseLibraryRows, exerciseRemap),
      workout_templates: mapWorkoutTemplates(workoutTemplateRows, templateRemap),
      template_exercises: mapTemplateExercises(templateExerciseRows, templateExerciseRemap, templateRemap, exerciseRemap),
      workout_sessions: mapWorkoutSessions(workoutSessionRows, sessionRemap, templateRemap),
      workout_session_exercises: mapWorkoutSessionExercises(
        workoutSessionExerciseRows,
        sessionExerciseRemap,
        sessionRemap,
        exerciseRemap,
      ),
    },
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(payload), "utf8");

  const rowCounts = Object.entries(payload.tables)
    .map(([table, rows]) => `  ${table}: ${rows.length}`)
    .join("\n");

  console.log(`Wrote ${OUTPUT_PATH}\n\nRows exported:\n${rowCounts}\n`);
  console.log("Skipped (no compatible mobile destination): daily_ai_reports, progress_photos, profiles, food_presets, workout_presets.\n");
  console.log("To get this onto your phone: email the file to yourself (or upload to Google Drive/Keep),");
  console.log("open it on your phone, select all the text and copy it, then in the app go to");
  console.log("Settings -> Import Data -> Paste from Clipboard -> Restore.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
