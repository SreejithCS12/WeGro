-- ==============================================================================
-- PERSONAL FITNESS TRACKER — INITIAL DATABASE SCHEMA
-- Migration: 20261031000001_initial_schema.sql
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. PROFILES
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    date_of_birth DATE,
    sex TEXT CHECK (sex IN ('male', 'female', 'other')),
    height_cm NUMERIC(5, 2),
    fitness_goal TEXT CHECK (fitness_goal IN ('lose_weight', 'maintain_weight', 'gain_weight')),
    activity_level TEXT,
    preferred_units TEXT DEFAULT 'metric',
    timezone TEXT DEFAULT 'UTC' NOT NULL,
    latest_weight_kg NUMERIC(5, 2),
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. FITNESS GOALS (Interval-based versioning)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fitness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    calorie_target INTEGER NOT NULL CHECK (calorie_target > 0),
    protein_grams INTEGER NOT NULL CHECK (protein_grams >= 0),
    carbs_grams INTEGER NOT NULL CHECK (carbs_grams >= 0),
    fat_grams INTEGER NOT NULL CHECK (fat_grams >= 0),
    water_ml INTEGER NOT NULL DEFAULT 3000 CHECK (water_ml > 0),
    workouts_per_week INTEGER DEFAULT 4,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_fitness_goals_lookup ON public.fitness_goals (user_id, effective_from, effective_to);

-- ------------------------------------------------------------------------------
-- 3. EXERCISES LIBRARY
-- (user_id is NULL for standard system exercises, populated for custom ones)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    muscle_group TEXT NOT NULL, -- Chest, Back, Legs, Shoulders, Arms, Core, Full Body
    equipment TEXT NOT NULL,    -- Barbell, Dumbbell, Machine, Cable, Bodyweight, Other
    exercise_type TEXT NOT NULL DEFAULT 'weight_reps' CHECK (exercise_type IN ('weight_reps', 'bodyweight_reps', 'assisted_bodyweight')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_exercises_user ON public.exercises (user_id, muscle_group);

-- ------------------------------------------------------------------------------
-- 4. WORKOUT ROUTINES (Templates)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID NOT NULL REFERENCES public.workout_routines(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    order_index INTEGER NOT NULL DEFAULT 0,
    target_sets INTEGER NOT NULL DEFAULT 3,
    target_reps TEXT DEFAULT '8-10',
    target_weight_kg NUMERIC(6, 2),
    rest_seconds INTEGER DEFAULT 90,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_routine_exercises ON public.routine_exercises (routine_id, order_index);

-- ------------------------------------------------------------------------------
-- 5. WEEKLY WORKOUT SCHEDULE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 1=Monday...
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (user_id, day_of_week)
);

-- ------------------------------------------------------------------------------
-- 6. WORKOUT SESSIONS (Execution / History)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    entry_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'discarded')),
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_workout_sessions_user_date ON public.workout_sessions (user_id, entry_date, status);

CREATE TABLE IF NOT EXISTS public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
    set_number INTEGER NOT NULL,
    reps INTEGER NOT NULL DEFAULT 0,
    weight_kg NUMERIC(6, 2) NOT NULL DEFAULT 0,
    set_type TEXT NOT NULL DEFAULT 'normal' CHECK (set_type IN ('normal', 'warmup', 'dropset')),
    is_completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_workout_sets_session ON public.workout_sets (session_id, exercise_id, set_number);

-- ------------------------------------------------------------------------------
-- 7. FOOD LIBRARY
-- (user_id is NULL for standard system foods, populated for custom ones)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT,
    serving_description TEXT NOT NULL, -- e.g., '100g', '1 piece', '1 cup'
    reference_quantity NUMERIC(8, 2) NOT NULL DEFAULT 100,
    reference_unit TEXT NOT NULL DEFAULT 'g',
    calories NUMERIC(8, 2) NOT NULL,
    protein NUMERIC(8, 2) NOT NULL,
    carbohydrates NUMERIC(8, 2) NOT NULL,
    fat NUMERIC(8, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_foods_user ON public.foods (user_id, name);

-- ------------------------------------------------------------------------------
-- 8. SAVED MEALS (Reusable combinations)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.saved_meal_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saved_meal_id UUID NOT NULL REFERENCES public.saved_meals(id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES public.foods(id) ON DELETE CASCADE,
    quantity NUMERIC(8, 2) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ------------------------------------------------------------------------------
-- 9. FOOD LOGS (Daily meal consumption snapshot)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.food_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    meal_category TEXT NOT NULL CHECK (meal_category IN ('breakfast', 'lunch', 'dinner', 'snacks')),
    food_id UUID REFERENCES public.foods(id) ON DELETE SET NULL,
    food_name_snapshot TEXT NOT NULL,
    quantity NUMERIC(8, 2) NOT NULL,
    unit TEXT NOT NULL,
    calories NUMERIC(8, 2) NOT NULL,
    protein NUMERIC(8, 2) NOT NULL,
    carbohydrates NUMERIC(8, 2) NOT NULL,
    fat NUMERIC(8, 2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_food_logs_user_date ON public.food_logs (user_id, entry_date, meal_category);

-- ------------------------------------------------------------------------------
-- 10. WATER LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.water_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    amount_ml INTEGER NOT NULL CHECK (amount_ml > 0),
    logged_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_water_logs_user_date ON public.water_logs (user_id, entry_date);

-- ------------------------------------------------------------------------------
-- 11. BODY WEIGHT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.body_weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_body_weight_logs_user_date ON public.body_weight_logs (user_id, entry_date);

-- Trigger to automatically update latest_weight_kg on profile
CREATE OR REPLACE FUNCTION public.sync_latest_profile_weight()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles
    SET latest_weight_kg = (
        SELECT weight_kg FROM public.body_weight_logs
        WHERE user_id = NEW.user_id
        ORDER BY entry_date DESC, created_at DESC
        LIMIT 1
    )
    WHERE id = NEW.user_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_sync_profile_weight
AFTER INSERT OR UPDATE OR DELETE ON public.body_weight_logs
FOR EACH ROW EXECUTE FUNCTION public.sync_latest_profile_weight();

-- ------------------------------------------------------------------------------
-- 12. BODY MEASUREMENT LOGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.body_measurement_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    waist_cm NUMERIC(5, 2),
    chest_cm NUMERIC(5, 2),
    arms_cm NUMERIC(5, 2),
    hips_cm NUMERIC(5, 2),
    thighs_cm NUMERIC(5, 2),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_body_measurement_logs_user_date ON public.body_measurement_logs (user_id, entry_date);

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurement_logs ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own
CREATE POLICY "Users can manage own profile" ON public.profiles
    FOR ALL USING (auth.uid() = id);

-- Fitness Goals: users manage their own
CREATE POLICY "Users can manage own goals" ON public.fitness_goals
    FOR ALL USING (auth.uid() = user_id);

-- Exercises: users can read public (user_id IS NULL) + read/write their own
CREATE POLICY "Users can read all public and own exercises" ON public.exercises
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own exercises" ON public.exercises
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own exercises" ON public.exercises
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own exercises" ON public.exercises
    FOR DELETE USING (auth.uid() = user_id);

-- Workout Routines
CREATE POLICY "Users can manage own routines" ON public.workout_routines
    FOR ALL USING (auth.uid() = user_id);

-- Routine Exercises
CREATE POLICY "Users can manage own routine exercises" ON public.routine_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_routines r
            WHERE r.id = routine_id AND r.user_id = auth.uid()
        )
    );

-- Workout Schedules
CREATE POLICY "Users can manage own schedules" ON public.workout_schedules
    FOR ALL USING (auth.uid() = user_id);

-- Workout Sessions & Sets
CREATE POLICY "Users can manage own sessions" ON public.workout_sessions
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own session sets" ON public.workout_sets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions s
            WHERE s.id = session_id AND s.user_id = auth.uid()
        )
    );

-- Foods Library: read public (user_id IS NULL) + own; write own
CREATE POLICY "Users can read all public and own foods" ON public.foods
    FOR SELECT USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "Users can insert own foods" ON public.foods
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own foods" ON public.foods
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own foods" ON public.foods
    FOR DELETE USING (auth.uid() = user_id);

-- Saved Meals & Items
CREATE POLICY "Users can manage own saved meals" ON public.saved_meals
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own saved meal items" ON public.saved_meal_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.saved_meals m
            WHERE m.id = saved_meal_id AND m.user_id = auth.uid()
        )
    );

-- Food Logs
CREATE POLICY "Users can manage own food logs" ON public.food_logs
    FOR ALL USING (auth.uid() = user_id);

-- Water Logs
CREATE POLICY "Users can manage own water logs" ON public.water_logs
    FOR ALL USING (auth.uid() = user_id);

-- Body Weight Logs
CREATE POLICY "Users can manage own body weight logs" ON public.body_weight_logs
    FOR ALL USING (auth.uid() = user_id);

-- Body Measurement Logs
CREATE POLICY "Users can manage own measurement logs" ON public.body_measurement_logs
    FOR ALL USING (auth.uid() = user_id);
