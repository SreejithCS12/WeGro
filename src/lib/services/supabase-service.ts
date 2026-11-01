"use client";

import { createClient } from "@/lib/supabase/client";
import {
  Profile,
  FitnessGoal,
  FoodLog,
  WaterLog,
  BodyWeightLog,
  BodyMeasurementLog,
  WorkoutSession,
  WorkoutSet,
  Exercise,
  Food,
  WorkoutRoutine,
  MealCategory,
} from "@/types/database";
import { isValidUUID } from "@/lib/utils";

// Check if Supabase is properly configured
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// -----------------------------------------------------------------------------
// AUTHENTICATION
// -----------------------------------------------------------------------------

export async function getCurrentUser() {
  const supabase = createClient();
  if (!supabase) return null;
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function signUpWithEmail(email: string, password: string, displayName: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const redirectUrl = typeof window !== "undefined" ? window.location.origin : undefined;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) throw error;
  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  if (!supabase) throw new Error("Supabase is not configured.");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = createClient();
  if (!supabase) return;
  await supabase.auth.signOut();
}

// -----------------------------------------------------------------------------
// PROFILE & GOALS
// -----------------------------------------------------------------------------

function decodeProfileTheme(data: any): Profile | null {
  if (!data) return null;
  let theme_color = data.theme_color;
  let preferred_units = data.preferred_units || "metric";

  if (preferred_units && typeof preferred_units === "string" && preferred_units.includes("|theme:")) {
    const parts = preferred_units.split("|theme:");
    preferred_units = parts[0] || "metric";
    if (!theme_color) {
      theme_color = parts[1];
    }
  }

  return {
    ...data,
    preferred_units,
    theme_color: theme_color || "purple",
  } as Profile;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return decodeProfileTheme(data);
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  // Persist theme_color to Supabase Auth user_metadata so it syncs reliably across all devices
  if (profile.theme_color) {
    try {
      await supabase.auth.updateUser({
        data: { theme_color: profile.theme_color },
      });
    } catch (e) {
      console.warn("Could not sync theme_color to auth user_metadata:", e);
    }
  }

  // Encode theme_color seamlessly into preferred_units (e.g. "metric|theme:blue")
  // so it persists in the profiles Postgres table across all devices without schema constraints!
  let storedUnits = profile.preferred_units || "metric";
  const cleanUnits = typeof storedUnits === "string" ? storedUnits.split("|")[0] || "metric" : "metric";
  if (profile.theme_color) {
    storedUnits = `${cleanUnits}|theme:${profile.theme_color}`;
  }

  const validProfile: any = {
    id: profile.id,
    updated_at: new Date().toISOString(),
  };

  if (profile.display_name !== undefined) validProfile.display_name = profile.display_name;
  if (profile.date_of_birth !== undefined) validProfile.date_of_birth = profile.date_of_birth;
  if (profile.sex !== undefined) validProfile.sex = profile.sex;
  if (profile.height_cm !== undefined) validProfile.height_cm = profile.height_cm;
  if (profile.fitness_goal !== undefined) validProfile.fitness_goal = profile.fitness_goal;
  if (profile.activity_level !== undefined) validProfile.activity_level = profile.activity_level;
  validProfile.preferred_units = storedUnits;
  if (profile.timezone !== undefined) validProfile.timezone = profile.timezone;
  if (profile.latest_weight_kg !== undefined) validProfile.latest_weight_kg = profile.latest_weight_kg;

  const { data, error } = await supabase
    .from("profiles")
    .upsert(validProfile)
    .select()
    .single();

  if (error) {
    console.error("Error saving profile to Supabase:", error);
    return null;
  }
  return decodeProfileTheme(data);
}

export async function fetchFitnessGoals(userId: string): Promise<FitnessGoal[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("fitness_goals")
    .select("*")
    .eq("user_id", userId)
    .order("effective_from", { ascending: false });

  if (error) return [];
  return (data || []) as FitnessGoal[];
}

export async function upsertFitnessGoal(goal: Partial<FitnessGoal> & { user_id: string }): Promise<FitnessGoal | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const goalPayload: any = {
    user_id: goal.user_id,
    calorie_target: goal.calorie_target ?? 2400,
    protein_grams: goal.protein_grams ?? 160,
    carbs_grams: goal.carbs_grams ?? 260,
    fat_grams: goal.fat_grams ?? 70,
    water_ml: goal.water_ml ?? 3000,
    workouts_per_week: goal.workouts_per_week ?? 4,
    effective_from: goal.effective_from || new Date().toISOString().split("T")[0],
    effective_to: goal.effective_to ?? null,
  };

  if (goal.id && isValidUUID(goal.id)) {
    goalPayload.id = goal.id;
  }

  const { data, error } = await supabase
    .from("fitness_goals")
    .upsert(goalPayload)
    .select()
    .single();

  if (error) {
    console.error("Error saving goal to Supabase:", error);
    return null;
  }
  return data as FitnessGoal;
}

// -----------------------------------------------------------------------------
// EXERCISES & FOODS (Public Library + Custom User Items)
// -----------------------------------------------------------------------------

export async function fetchExercises(userId?: string): Promise<Exercise[]> {
  const supabase = createClient();
  if (!supabase) return [];

  let query = supabase.from("exercises").select("*");
  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`);
  } else {
    query = query.is("user_id", null);
  }

  const { data, error } = await query.order("name");
  if (error) {
    console.error("Error fetching exercises from Supabase:", error);
    return [];
  }
  return (data || []) as Exercise[];
}

export async function fetchFoods(userId?: string): Promise<Food[]> {
  const supabase = createClient();
  if (!supabase) return [];

  let query = supabase.from("foods").select("*");
  if (userId) {
    query = query.or(`user_id.is.null,user_id.eq.${userId}`);
  } else {
    query = query.is("user_id", null);
  }

  const { data, error } = await query.order("name");
  if (error) {
    console.error("Error fetching foods from Supabase:", error);
    return [];
  }
  return (data || []) as Food[];
}

// -----------------------------------------------------------------------------
// FOOD LOGS
// -----------------------------------------------------------------------------

export async function fetchFoodLogs(userId: string): Promise<FoodLog[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("food_logs")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("Error fetching food logs from Supabase:", error);
    return [];
  }
  return (data || []) as FoodLog[];
}

export async function insertFoodLog(log: {
  id?: string;
  user_id: string;
  entry_date: string;
  meal_category: MealCategory;
  food_name_snapshot: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  notes?: string | null;
  food_id?: string | null;
}): Promise<FoodLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const payload: any = {
    user_id: log.user_id,
    entry_date: log.entry_date,
    meal_category: log.meal_category,
    food_name_snapshot: log.food_name_snapshot,
    quantity: log.quantity,
    unit: log.unit,
    calories: log.calories,
    protein: log.protein,
    carbohydrates: log.carbohydrates,
    fat: log.fat,
    notes: log.notes || null,
  };

  // Always use the client-generated ID when valid so client & server IDs match
  if (log.id && isValidUUID(log.id)) {
    payload.id = log.id;
  }
  if (log.food_id && isValidUUID(log.food_id)) {
    payload.food_id = log.food_id;
  }

  const { data, error } = await supabase
    .from("food_logs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting food log in Supabase:", error);
    return null;
  }
  return data as FoodLog;
}

export async function deleteFoodLog(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  // If id is not a valid UUID, it was a local demo item that was never in Supabase
  if (!isValidUUID(id)) return true;

  const { error } = await supabase.from("food_logs").delete().eq("id", id);
  if (error) {
    console.error("Error deleting food log from Supabase:", error);
    return false;
  }
  return true;
}

// -----------------------------------------------------------------------------
// WATER LOGS
// -----------------------------------------------------------------------------

export async function fetchWaterLogs(userId: string): Promise<WaterLog[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("water_logs")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });

  if (error) {
    console.error("Error fetching water logs from Supabase:", error);
    return [];
  }
  return (data || []) as WaterLog[];
}

export async function insertWaterLog(log: {
  id?: string;
  user_id: string;
  entry_date: string;
  amount_ml: number;
}): Promise<WaterLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const payload: any = {
    user_id: log.user_id,
    entry_date: log.entry_date,
    amount_ml: log.amount_ml,
  };

  if (log.id && isValidUUID(log.id)) {
    payload.id = log.id;
  }

  const { data, error } = await supabase
    .from("water_logs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting water log in Supabase:", error);
    return null;
  }
  return data as WaterLog;
}

export async function deleteWaterLog(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  if (!isValidUUID(id)) return true;

  const { error } = await supabase.from("water_logs").delete().eq("id", id);
  if (error) {
    console.error("Error deleting water log from Supabase:", error);
    return false;
  }
  return true;
}

// -----------------------------------------------------------------------------
// BODY WEIGHT & MEASUREMENT LOGS
// -----------------------------------------------------------------------------

export async function fetchWeightLogs(userId: string): Promise<BodyWeightLog[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("body_weight_logs")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !data) {
    if (error) console.error("Error fetching weight logs from Supabase:", error);
    return [];
  }

  // Deduplicate by entry_date, keeping latest entry for each date
  const byDate = new Map<string, BodyWeightLog>();
  for (const item of data as BodyWeightLog[]) {
    byDate.set(item.entry_date, item);
  }

  return Array.from(byDate.values()).sort((a, b) => a.entry_date.localeCompare(b.entry_date));
}

export async function insertWeightLog(log: {
  id?: string;
  user_id: string;
  entry_date: string;
  weight_kg: number;
  notes?: string | null;
}): Promise<BodyWeightLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  // Clean up any existing log for this user & entry_date to keep history strictly unique per date
  await supabase
    .from("body_weight_logs")
    .delete()
    .eq("user_id", log.user_id)
    .eq("entry_date", log.entry_date);

  const payload: any = {
    user_id: log.user_id,
    entry_date: log.entry_date,
    weight_kg: log.weight_kg,
    notes: log.notes || null,
  };

  if (log.id && isValidUUID(log.id)) {
    payload.id = log.id;
  }

  const { data, error } = await supabase
    .from("body_weight_logs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting weight log in Supabase:", error);
    return null;
  }
  return data as BodyWeightLog;
}

export async function deleteWeightLog(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  if (!isValidUUID(id)) return true;

  const { error } = await supabase.from("body_weight_logs").delete().eq("id", id);
  return !error;
}

export async function fetchMeasurementLogs(userId: string): Promise<BodyMeasurementLog[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("body_measurement_logs")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Error fetching measurement logs from Supabase:", error);
    return [];
  }

  const byDate = new Map<string, BodyMeasurementLog>();
  for (const item of data as BodyMeasurementLog[]) {
    if (!byDate.has(item.entry_date)) {
      byDate.set(item.entry_date, item);
    }
  }

  return Array.from(byDate.values()).sort((a, b) => b.entry_date.localeCompare(a.entry_date));
}

export async function insertMeasurementLog(log: {
  id?: string;
  user_id: string;
  entry_date: string;
  waist_cm?: number | null;
  chest_cm?: number | null;
  arms_cm?: number | null;
  hips_cm?: number | null;
  thighs_cm?: number | null;
  notes?: string | null;
}): Promise<BodyMeasurementLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  await supabase
    .from("body_measurement_logs")
    .delete()
    .eq("user_id", log.user_id)
    .eq("entry_date", log.entry_date);

  const payload: any = {
    user_id: log.user_id,
    entry_date: log.entry_date,
    waist_cm: log.waist_cm ?? null,
    chest_cm: log.chest_cm ?? null,
    arms_cm: log.arms_cm ?? null,
    hips_cm: log.hips_cm ?? null,
    thighs_cm: log.thighs_cm ?? null,
    notes: log.notes || null,
  };

  if (log.id && isValidUUID(log.id)) {
    payload.id = log.id;
  }

  const { data, error } = await supabase
    .from("body_measurement_logs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error("Error inserting measurement log in Supabase:", error);
    return null;
  }
  return data as BodyMeasurementLog;
}

// -----------------------------------------------------------------------------
// WORKOUT SESSIONS & SETS
// -----------------------------------------------------------------------------

export async function fetchWorkoutSessions(userId: string): Promise<WorkoutSession[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("workout_sessions")
    .select("*, sets:workout_sets(*)")
    .eq("user_id", userId)
    .order("started_at", { ascending: false });

  if (error || !data) {
    if (error) console.error("Error fetching workout sessions:", error);
    return [];
  }

  return data.map((s: any) => {
    const started = s.started_at || s.created_at || new Date().toISOString();
    const entryDate = started.slice(0, 10);
    const durationSeconds =
      s.completed_at && s.started_at
        ? Math.max(
            1,
            Math.round(
              (new Date(s.completed_at).getTime() - new Date(s.started_at).getTime()) / 1000
            )
          )
        : undefined;

    const mappedSets: WorkoutSet[] = (s.sets || []).map((st: any) => ({
      id: st.id,
      session_id: st.session_id,
      exercise_id: st.exercise_id,
      set_number: st.set_index ?? 1,
      set_type: st.set_type || "normal",
      weight_kg: Number(st.weight_kg) || 0,
      reps: Number(st.reps) || 0,
      is_completed: Boolean(st.is_completed),
      created_at: st.created_at,
    }));

    mappedSets.sort((a, b) => a.set_number - b.set_number);

    return {
      id: s.id,
      user_id: s.user_id,
      routine_id: s.routine_id,
      name: s.name,
      entry_date: entryDate,
      status: s.status,
      started_at: s.started_at,
      completed_at: s.completed_at,
      duration_seconds: durationSeconds,
      notes: s.notes,
      created_at: s.created_at,
      sets: mappedSets,
    } as WorkoutSession;
  });
}

export async function saveWorkoutSession(
  session: Omit<WorkoutSession, "created_at">,
  sets: Omit<WorkoutSet, "id" | "created_at">[]
): Promise<WorkoutSession | null> {
  const supabase = createClient();
  if (!supabase) return null;

  // Supabase routine_id is UUID foreign key; pass null if not a valid UUID (e.g. built-in routine string)
  const validRoutineId = session.routine_id && isValidUUID(session.routine_id) ? session.routine_id : null;

  // Only pass columns that actually exist in Supabase workout_sessions table
  const sessionPayload: any = {
    id: session.id,
    user_id: session.user_id,
    routine_id: validRoutineId,
    name: session.name,
    status: session.status,
    started_at: session.started_at || new Date().toISOString(),
    completed_at: session.completed_at || null,
    notes: session.notes || null,
  };

  const { data: sessionData, error: sessionErr } = await supabase
    .from("workout_sessions")
    .upsert(sessionPayload)
    .select()
    .single();

  if (sessionErr) {
    console.error("Error saving workout session:", sessionErr);
    return null;
  }

  // Insert sets if any
  if (sets.length > 0) {
    await supabase.from("workout_sets").delete().eq("session_id", sessionData.id);

    // Filter and map to valid Supabase columns (set_index instead of set_number)
    const validSets = sets
      .filter((s) => s.exercise_id && isValidUUID(s.exercise_id))
      .map((s, idx) => ({
        session_id: sessionData.id,
        exercise_id: s.exercise_id,
        set_index: s.set_number ?? idx + 1,
        set_type: s.set_type || "normal",
        weight_kg: Number(s.weight_kg) || 0,
        reps: Number(s.reps) || 0,
        is_completed: Boolean(s.is_completed),
      }));

    if (validSets.length > 0) {
      const { error: setsErr } = await supabase.from("workout_sets").insert(validSets);
      if (setsErr) {
        console.error("Error saving workout sets:", setsErr);
      }
    }
  }

  return sessionData as WorkoutSession;
}

export async function deleteWorkoutSession(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  if (!isValidUUID(id)) return true;

  const { error } = await supabase.from("workout_sessions").delete().eq("id", id);
  return !error;
}

// -----------------------------------------------------------------------------
// WORKOUT ROUTINES
// -----------------------------------------------------------------------------

export async function fetchWorkoutRoutines(userId: string): Promise<WorkoutRoutine[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("workout_routines")
    .select("*, exercises:routine_exercises(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching routines from Supabase:", error);
    return [];
  }
  return (data || []) as WorkoutRoutine[];
}

export async function upsertWorkoutRoutine(routine: WorkoutRoutine): Promise<WorkoutRoutine | null> {
  const supabase = createClient();
  if (!supabase) return null;

  if (!isValidUUID(routine.id)) {
    return null;
  }

  const { data: routineData, error: routineErr } = await supabase
    .from("workout_routines")
    .upsert({
      id: routine.id,
      user_id: routine.user_id,
      name: routine.name,
      description: routine.description || null,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (routineErr) {
    console.error("Error upserting routine:", routineErr);
    return null;
  }

  if (routine.exercises && routine.exercises.length > 0) {
    await supabase.from("routine_exercises").delete().eq("routine_id", routineData.id);

    const validExercises = routine.exercises
      .filter((re) => re.exercise_id && isValidUUID(re.exercise_id))
      .map((re, idx) => ({
        routine_id: routineData.id,
        exercise_id: re.exercise_id,
        order_index: re.order_index ?? idx,
        target_sets: re.target_sets || 3,
        target_reps: re.target_reps || "10",
        target_weight_kg: re.target_weight_kg ?? null,
        rest_seconds: re.rest_seconds || 90,
        notes: re.notes || null,
      }));

    if (validExercises.length > 0) {
      const { error: reErr } = await supabase.from("routine_exercises").insert(validExercises);
      if (reErr) {
        console.error("Error saving routine exercises:", reErr);
      }
    }
  }

  return routineData as WorkoutRoutine;
}

export async function deleteWorkoutRoutine(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  if (!isValidUUID(id)) return true;

  const { error } = await supabase.from("workout_routines").delete().eq("id", id);
  return !error;
}
