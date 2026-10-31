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
} from "@/types/database";

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

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
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

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) return null;
  return data as Profile;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      ...profile,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error("Error saving profile to Supabase:", error);
    return null;
  }
  return data as Profile;
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

  const { data, error } = await supabase
    .from("fitness_goals")
    .upsert(goal)
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
  if (error) return [];
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
  if (error) return [];
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

  if (error) return [];
  return (data || []) as FoodLog[];
}

export async function insertFoodLog(log: Omit<FoodLog, "id" | "created_at">): Promise<FoodLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("food_logs")
    .insert(log)
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

  const { error } = await supabase.from("food_logs").delete().eq("id", id);
  return !error;
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

  if (error) return [];
  return (data || []) as WaterLog[];
}

export async function insertWaterLog(log: Omit<WaterLog, "id" | "logged_at" | "created_at">): Promise<WaterLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("water_logs")
    .insert(log)
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

  const { error } = await supabase.from("water_logs").delete().eq("id", id);
  return !error;
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
    .order("entry_date", { ascending: true });

  if (error) return [];
  return (data || []) as BodyWeightLog[];
}

export async function insertWeightLog(log: Omit<BodyWeightLog, "id" | "created_at">): Promise<BodyWeightLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("body_weight_logs")
    .insert(log)
    .select()
    .single();

  if (error) {
    console.error("Error inserting weight log in Supabase:", error);
    return null;
  }
  return data as BodyWeightLog;
}

export async function fetchMeasurementLogs(userId: string): Promise<BodyMeasurementLog[]> {
  const supabase = createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("body_measurement_logs")
    .select("*")
    .eq("user_id", userId)
    .order("entry_date", { ascending: false });

  if (error) return [];
  return (data || []) as BodyMeasurementLog[];
}

export async function insertMeasurementLog(log: Omit<BodyMeasurementLog, "id" | "created_at">): Promise<BodyMeasurementLog | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("body_measurement_logs")
    .insert(log)
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

  if (error) return [];
  return (data || []) as WorkoutSession[];
}

export async function saveWorkoutSession(
  session: Omit<WorkoutSession, "created_at">,
  sets: Omit<WorkoutSet, "id" | "created_at">[]
): Promise<WorkoutSession | null> {
  const supabase = createClient();
  if (!supabase) return null;

  // Insert or update session
  const { data: sessionData, error: sessionErr } = await supabase
    .from("workout_sessions")
    .upsert({
      id: session.id,
      user_id: session.user_id,
      routine_id: session.routine_id,
      name: session.name,
      entry_date: session.entry_date,
      status: session.status,
      started_at: session.started_at,
      completed_at: session.completed_at,
      duration_seconds: session.duration_seconds,
      notes: session.notes,
    })
    .select()
    .single();

  if (sessionErr) {
    console.error("Error saving workout session:", sessionErr);
    return null;
  }

  // Insert sets if any
  if (sets.length > 0) {
    // Delete previous sets for this session to keep sets cleanly synced
    await supabase.from("workout_sets").delete().eq("session_id", sessionData.id);

    const { error: setsErr } = await supabase.from("workout_sets").insert(
      sets.map((s, idx) => ({
        session_id: sessionData.id,
        exercise_id: s.exercise_id,
        set_number: s.set_number ?? idx + 1,
        set_type: s.set_type,
        weight_kg: s.weight_kg,
        reps: s.reps,
        is_completed: s.is_completed,
      }))
    );

    if (setsErr) {
      console.error("Error saving workout sets:", setsErr);
    }
  }

  return sessionData as WorkoutSession;
}

export async function deleteWorkoutSession(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

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

  if (error) return [];
  return (data || []) as WorkoutRoutine[];
}

export async function upsertWorkoutRoutine(routine: WorkoutRoutine): Promise<WorkoutRoutine | null> {
  const supabase = createClient();
  if (!supabase) return null;

  const { data: routineData, error: routineErr } = await supabase
    .from("workout_routines")
    .upsert({
      id: routine.id,
      user_id: routine.user_id,
      name: routine.name,
      description: routine.description,
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
    await supabase.from("routine_exercises").insert(
      routine.exercises.map((re, idx) => ({
        routine_id: routineData.id,
        exercise_id: re.exercise_id,
        order_index: re.order_index ?? idx,
        target_sets: re.target_sets,
        target_reps: re.target_reps,
        target_weight_kg: re.target_weight_kg,
        rest_seconds: re.rest_seconds,
        notes: re.notes,
      }))
    );
  }

  return routineData as WorkoutRoutine;
}

export async function deleteWorkoutRoutine(id: string): Promise<boolean> {
  const supabase = createClient();
  if (!supabase) return false;

  const { error } = await supabase.from("workout_routines").delete().eq("id", id);
  return !error;
}

