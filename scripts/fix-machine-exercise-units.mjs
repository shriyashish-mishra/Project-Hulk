// One-off correction: the user always meant lbs for machine/cable exercise
// weights but had been typing "kg" in their logs. This relabels the unit
// text in stored `daily_ai_reports.parsed_json` for the four confirmed
// exercises — it NEVER changes the numeric value, only "kg" -> "lbs".
// Dumbbell/barbell entries are untouched (they were never in scope).
//
// Usage:
//   node --env-file=.env.local scripts/fix-machine-exercise-units.mjs           (dry run, default)
//   node --env-file=.env.local scripts/fix-machine-exercise-units.mjs --apply   (writes changes)
//
// Scoped to PROJECT_HULK_USER_ID, the same single-user scoping every other
// service-role script in this repo uses (src/lib/quick-log/auth.ts et al.)
// — this uses the service-role key, which bypasses RLS entirely, so an
// explicit user filter is what keeps it from touching rows it shouldn't.

import { createClient } from "@supabase/supabase-js";

const MACHINE_EXERCISE_NAMES = ["lat pulldown", "machine row", "face pull", "tricep pushdown"];
const KG_PATTERN = /(\d)\s*kg\b/gi;

const apply = process.argv.includes("--apply");

function isMachineExercise(name) {
  const lower = name.toLowerCase();
  return MACHINE_EXERCISE_NAMES.some((needle) => lower.includes(needle));
}

function relabelDetail(detail) {
  return detail.replace(KG_PATTERN, "$1 lbs");
}

/** Returns a new array (only exercises that actually change get a new object) plus the list of {name, before, after} changes made. */
function relabelExerciseList(exercises) {
  if (!Array.isArray(exercises)) return { next: exercises, changes: [] };

  const changes = [];
  const next = exercises.map((exercise) => {
    if (
      !exercise ||
      typeof exercise !== "object" ||
      typeof exercise.name !== "string" ||
      typeof exercise.detail !== "string"
    ) {
      return exercise;
    }
    if (!isMachineExercise(exercise.name) || !KG_PATTERN.test(exercise.detail)) {
      return exercise;
    }
    // .test() above advanced the regex's lastIndex (global flag) — reset before reuse.
    KG_PATTERN.lastIndex = 0;
    const after = relabelDetail(exercise.detail);
    changes.push({ name: exercise.name, before: exercise.detail, after });
    return { ...exercise, detail: after };
  });

  return { next, changes };
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const userId = process.env.PROJECT_HULK_USER_ID;

  if (!url || !serviceRoleKey || !userId) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or PROJECT_HULK_USER_ID. Run with: node --env-file=.env.local scripts/fix-machine-exercise-units.mjs",
    );
  }

  const supabase = createClient(url, serviceRoleKey);

  const { data: reports, error } = await supabase
    .from("daily_ai_reports")
    .select("id, report_date, parsed_json")
    .eq("user_id", userId)
    .order("report_date", { ascending: true });

  if (error) throw new Error(error.message);

  console.log(`Scanning ${reports.length} report(s) for: ${MACHINE_EXERCISE_NAMES.join(", ")}`);
  console.log(`Mode: ${apply ? "APPLY (writing changes)" : "DRY RUN (no writes)"}\n`);

  let changedReportCount = 0;
  let changedExerciseCount = 0;

  for (const report of reports) {
    const parsed = report.parsed_json;
    if (!parsed || typeof parsed !== "object") continue;

    const workout = relabelExerciseList(parsed.workout_exercises);
    const tomorrow = relabelExerciseList(parsed.tomorrow_workout_exercises);

    if (workout.changes.length === 0 && tomorrow.changes.length === 0) continue;

    changedReportCount += 1;
    console.log(`Report ${report.id} (${report.report_date}):`);
    for (const change of [...workout.changes, ...tomorrow.changes]) {
      changedExerciseCount += 1;
      console.log(`  "${change.name}": "${change.before}" -> "${change.after}"`);
    }

    if (apply) {
      const { error: updateError } = await supabase
        .from("daily_ai_reports")
        .update({
          parsed_json: {
            ...parsed,
            workout_exercises: workout.next,
            tomorrow_workout_exercises: tomorrow.next,
          },
        })
        .eq("id", report.id);

      if (updateError) {
        console.error(`  FAILED: ${updateError.message}`);
      } else {
        console.log("  updated");
      }
    }
  }

  console.log(
    `\n${changedReportCount} report(s), ${changedExerciseCount} exercise entr${changedExerciseCount === 1 ? "y" : "ies"} ${apply ? "updated" : "would be updated"}.`,
  );
  if (!apply && changedReportCount > 0) {
    console.log("Re-run with --apply to write these changes.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
