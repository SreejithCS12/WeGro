# Supabase Database Setup

This folder contains the complete SQL migrations and seed data for the **Personal Fitness Tracker**.

## Applying to your Supabase Project

You can apply these migrations in one of two ways:

### Option 1: Supabase Web Dashboard (Easiest)
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open your project.
3. In the left navigation, click **SQL Editor**.
4. Click **New Query**.
5. Copy and paste the contents of `migrations/20261031000001_initial_schema.sql` and click **Run**.
6. Copy and paste the contents of `migrations/20261031000002_seed_data.sql` and click **Run**.

### Option 2: Supabase CLI
If you have the Supabase CLI linked to your project:
```bash
npx supabase db push
```

## Schema Entities Summary
- `profiles`: User information, timezone, preferred units, and auto-synchronized latest weight.
- `fitness_goals`: Interval-versioned targets (`effective_from` / `effective_to`) for calories, protein, carbs, fat, water, and workout frequency.
- `exercises`: 50+ pre-seeded gym exercises + user-created custom exercises.
- `workout_routines` & `routine_exercises`: Reusable workout templates.
- `workout_schedules`: Day-of-week routine schedule.
- `workout_sessions` & `workout_sets`: Real-time session execution, in-progress recovery, and historical logs.
- `foods`: Pre-seeded common foods, Indian staples, and custom user recipes.
- `saved_meals` & `saved_meal_items`: Reusable meal templates.
- `food_logs`: Daily meal logs with immutable nutritional snapshots.
- `water_logs`: Granular hydration logs with timestamp and entry date.
- `body_weight_logs` & `body_measurement_logs`: Body progress metrics over time.
