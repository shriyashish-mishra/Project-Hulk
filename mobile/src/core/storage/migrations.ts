import type { SQLiteDatabase } from 'expo-sqlite';

export const DATABASE_NAME = 'project-hulk.db';

interface Migration {
  version: number;
  up: string;
}

/**
 * Ordered, additive migrations tracked via SQLite's `PRAGMA user_version` —
 * the pattern `expo-sqlite` itself documents for a `SQLiteProvider`'s
 * `onInit`. Never edit a migration once it has shipped to a real device;
 * append a new one instead, the same rule as the Supabase migrations in
 * the web app's `supabase/migrations/`.
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    up: `
      CREATE TABLE food_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'snacks', 'dinner')),
        raw_text TEXT NOT NULL,
        logged_on TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE (meal_type, logged_on)
      );
      CREATE INDEX food_logs_logged_on_idx ON food_logs (logged_on);

      CREATE TABLE workout_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        raw_text TEXT NOT NULL,
        logged_on TEXT NOT NULL UNIQUE,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE water_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        glass_count INTEGER NOT NULL DEFAULT 0,
        glass_size_ml INTEGER NOT NULL DEFAULT 250,
        target_glasses INTEGER NOT NULL DEFAULT 8,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE weight_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        measured_on TEXT NOT NULL UNIQUE,
        weight_kg REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    version: 2,
    up: `
      -- Deliberately no UNIQUE(entry_date) and no per-day constraint at
      -- all — the Journal must not assume one entry per day forever
      -- (morning/evening entries, templates, multiple entries are future
      -- features this schema shouldn't block). "Today's entry" is a
      -- business-logic concept (the service layer's job), not a database
      -- constraint.
      CREATE TABLE journal_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_date TEXT NOT NULL,
        body TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX journal_entries_entry_date_idx ON journal_entries (entry_date);

      -- The crash-recovery buffer: one in-progress draft per date, written
      -- far more often than journal_entries. entry_id is NULL until the
      -- entry it belongs to has been created for the first time.
      CREATE TABLE journal_drafts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_date TEXT NOT NULL UNIQUE,
        entry_id INTEGER REFERENCES journal_entries (id) ON DELETE SET NULL,
        body TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    version: 3,
    up: `
      -- Water is now an append-only log of individual additions rather
      -- than a mutable running total — that's what makes "undo last
      -- addition" and "today's history" possible. The day's total is
      -- always SUM(amount_ml), computed live, never stored, so it can
      -- never drift out of sync with its own history.
      -- water_logs (v1) is deprecated by this table and no longer written to.
      CREATE TABLE water_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_date TEXT NOT NULL,
        amount_ml INTEGER NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX water_entries_entry_date_idx ON water_entries (entry_date);

      -- The goal is deliberately its own table, not a column on
      -- water_entries — it's a target the user sets, not a fact that was
      -- logged.
      CREATE TABLE water_goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entry_date TEXT NOT NULL UNIQUE,
        goal_ml INTEGER NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- Workout grows structured fields alongside its existing free-text
      -- note (raw_text becomes "notes" in the app going forward) — additive
      -- columns, nullable, so nothing about the v1 table is disturbed.
      ALTER TABLE workout_logs ADD COLUMN workout_type TEXT;
      ALTER TABLE workout_logs ADD COLUMN duration_minutes INTEGER;

      CREATE TABLE sleep_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        logged_on TEXT NOT NULL UNIQUE,
        bedtime TEXT,
        wake_time TEXT,
        duration_minutes INTEGER,
        quality TEXT CHECK (quality IN ('poor', 'fair', 'good', 'great')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- Cycle tracking foundation only: an opt-in flag and manual period
      -- entries. No phase math, no predictions — that's explicitly future
      -- AI-insights work, not this table's job.
      CREATE TABLE cycle_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        enabled INTEGER NOT NULL DEFAULT 0
      );
      INSERT INTO cycle_settings (id, enabled) VALUES (1, 0);

      CREATE TABLE cycle_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        start_date TEXT NOT NULL,
        end_date TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX cycle_logs_start_date_idx ON cycle_logs (start_date);
    `,
  },
  {
    version: 4,
    up: `
      -- No UNIQUE(report_date) — regenerating a report for the same day
      -- creates a new row rather than overwriting the old one, so history
      -- (weekly/monthly rollups, "how has feedback changed") stays intact.
      -- wins/improvements/tomorrow_suggestions are JSON-encoded arrays —
      -- SQLite has no native array type, and this app has no need for a
      -- separate child table just to query into them individually.
      CREATE TABLE ai_reports (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        report_date TEXT NOT NULL,
        context_version TEXT NOT NULL,
        prompt_version TEXT NOT NULL,
        summary TEXT NOT NULL,
        nutrition_score INTEGER NOT NULL,
        activity_score INTEGER NOT NULL,
        recovery_score INTEGER NOT NULL,
        wins TEXT NOT NULL,
        improvements TEXT NOT NULL,
        nutrition_feedback TEXT NOT NULL,
        workout_feedback TEXT NOT NULL,
        recovery_feedback TEXT NOT NULL,
        tomorrow_suggestions TEXT NOT NULL,
        raw_response TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX ai_reports_report_date_idx ON ai_reports (report_date);
    `,
  },
  {
    version: 5,
    up: `
      -- file_path points at a file the app copied into its own persistent
      -- storage (Paths.document/progress-photos/) — never the original
      -- picker/camera URI, which can be a temporary location the OS is
      -- free to clean up.
      CREATE TABLE progress_photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        captured_on TEXT NOT NULL,
        view_type TEXT NOT NULL CHECK (view_type IN ('front', 'side', 'back')),
        file_path TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX progress_photos_captured_on_idx ON progress_photos (captured_on);
    `,
  },
  {
    version: 6,
    up: `
      -- Structured workout logging sits alongside workout_logs, not on top
      -- of it — a template/session is a front-end for generating a good
      -- raw_text string, written back through the same upsertWorkoutLog
      -- the free-text sheet already calls. Nothing here is read by the AI
      -- context builder directly.
      CREATE TABLE exercise_library (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        category TEXT NOT NULL CHECK (category IN ('strength', 'cardio')),
        default_unit TEXT NOT NULL DEFAULT 'kg' CHECK (default_unit IN ('kg', 'lbs')),
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE workout_templates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      -- One row per exercise on a template. default_weight_unit is its own
      -- column (not just read from exercise_library) so a template can
      -- pin a unit independent of the library's default.
      CREATE TABLE template_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER NOT NULL REFERENCES workout_templates (id) ON DELETE CASCADE,
        exercise_id INTEGER NOT NULL REFERENCES exercise_library (id) ON DELETE RESTRICT,
        position INTEGER NOT NULL,
        default_sets INTEGER,
        default_reps INTEGER,
        default_weight REAL,
        default_weight_unit TEXT CHECK (default_weight_unit IN ('kg', 'lbs')),
        default_rest_seconds INTEGER,
        default_duration_minutes INTEGER,
        default_incline_percent REAL,
        default_speed_kph REAL,
        notes TEXT
      );
      CREATE INDEX template_exercises_template_id_idx ON template_exercises (template_id);

      -- One row per "Start Workout" tap. template_name_snapshot survives
      -- the source template being renamed or deleted later.
      CREATE TABLE workout_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        template_id INTEGER REFERENCES workout_templates (id) ON DELETE SET NULL,
        template_name_snapshot TEXT NOT NULL,
        logged_on TEXT NOT NULL,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        completed_at TEXT,
        total_calories INTEGER,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX workout_sessions_logged_on_idx ON workout_sessions (logged_on);

      -- The live, editable rows behind the Active Workout Session screen.
      -- Cardio rows use sets_planned = 1 / sets_completed 0|1 as their
      -- single completion toggle rather than a separate boolean column.
      CREATE TABLE workout_session_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES workout_sessions (id) ON DELETE CASCADE,
        exercise_id INTEGER NOT NULL REFERENCES exercise_library (id) ON DELETE RESTRICT,
        position INTEGER NOT NULL,
        sets_planned INTEGER,
        sets_completed INTEGER NOT NULL DEFAULT 0,
        reps INTEGER,
        weight REAL,
        weight_unit TEXT CHECK (weight_unit IN ('kg', 'lbs')),
        duration_minutes INTEGER,
        incline_percent REAL,
        speed_kph REAL,
        notes TEXT
      );
      CREATE INDEX workout_session_exercises_session_id_idx ON workout_session_exercises (session_id);

      -- Seed catalog: the exercises from the app's own worked example, plus
      -- the machine exercises already corrected to lbs in the web app's
      -- historical reports (see scripts/fix-machine-exercise-units.mjs) —
      -- kept consistent here so a fresh template defaults to the same unit.
      INSERT INTO exercise_library (name, category, default_unit) VALUES
        ('Bicep Curls', 'strength', 'kg'),
        ('Hammer Curls', 'strength', 'kg'),
        ('Lat Pulldown', 'strength', 'lbs'),
        ('Machine Row', 'strength', 'lbs'),
        ('Face Pull', 'strength', 'lbs'),
        ('Tricep Pushdown', 'strength', 'lbs'),
        ('Incline Walk', 'cardio', 'kg');
    `,
  },
];

/**
 * Applies every migration newer than the database's current
 * `user_version`, in order. Pass this directly as `SQLiteProvider`'s
 * `onInit` — it runs once, before any screen can query the database.
 */
export async function runMigrations(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA journal_mode = WAL');

  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = versionRow?.user_version ?? 0;

  for (const migration of MIGRATIONS) {
    if (migration.version <= currentVersion) continue;
    await db.execAsync(migration.up);
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    currentVersion = migration.version;
  }
}
