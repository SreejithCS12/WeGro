"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Profile,
  FitnessGoal,
  Exercise,
  Food,
  WorkoutRoutine,
  RoutineExercise,
  WorkoutSession,
  WorkoutSet,
  WorkoutSetType,
  FoodLog,
  WaterLog,
  BodyWeightLog,
  BodyMeasurementLog,
  MealCategory,
} from "@/types/database";
import { INITIAL_EXERCISES, INITIAL_FOODS, INITIAL_ROUTINES } from "@/lib/data/seed";
import { formatDateToISO, generateUUID } from "@/lib/utils";
import {
  isSupabaseConfigured,
  signOut as supabaseSignOut,
  fetchProfile,
  upsertProfile,
  fetchFitnessGoals,
  upsertFitnessGoal,
  fetchExercises,
  fetchFoods,
  fetchFoodLogs,
  insertFoodLog as supabaseInsertFoodLog,
  deleteFoodLog as supabaseDeleteFoodLog,
  fetchWaterLogs,
  insertWaterLog as supabaseInsertWaterLog,
  deleteWaterLog as supabaseDeleteWaterLog,
  fetchWeightLogs,
  insertWeightLog as supabaseInsertWeightLog,
  fetchMeasurementLogs,
  insertMeasurementLog as supabaseInsertMeasurementLog,
  fetchWorkoutSessions,
  saveWorkoutSession as supabaseSaveWorkoutSession,
  deleteWorkoutSession as supabaseDeleteWorkoutSession,
  fetchWorkoutRoutines,
  upsertWorkoutRoutine as supabaseUpsertRoutine,
  deleteWorkoutRoutine as supabaseDeleteRoutine,
} from "@/lib/services/supabase-service";
import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY_PREFIX = "pft_v1_";

const DEFAULT_PROFILE: Profile = {
  id: "user-1",
  display_name: "Sreejith",
  date_of_birth: "1998-05-15",
  sex: "male",
  height_cm: 178,
  fitness_goal: "maintain_weight",
  activity_level: "Moderate (3-5 days gym)",
  preferred_units: "metric",
  timezone: "Asia/Kolkata",
  latest_weight_kg: 78.5,
  theme_color: "purple",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const DEFAULT_GOAL: FitnessGoal = {
  id: "goal-1",
  user_id: "user-1",
  calorie_target: 2400,
  protein_grams: 160,
  carbs_grams: 260,
  fat_grams: 70,
  water_ml: 3000,
  workouts_per_week: 4,
  effective_from: "2026-01-01",
  effective_to: null,
  created_at: new Date().toISOString(),
};

export interface TrackerState {
  hasCompletedOnboarding: boolean;
  restDays: string[]; // List of YYYY-MM-DD dates marked as rest days
  weeklySchedule: Record<number, string | null>; // 1=Mon..6=Sat, 0=Sun. routineId or null
  profile: Profile;
  goals: FitnessGoal[];
  exercises: Exercise[];
  foods: Food[];
  routines: WorkoutRoutine[];
  sessions: WorkoutSession[];
  foodLogs: FoodLog[];
  waterLogs: WaterLog[];
  weightLogs: BodyWeightLog[];
  measurementLogs: BodyMeasurementLog[];
}

export const DEFAULT_WEEKLY_SCHEDULE: Record<number, string | null> = {
  1: "routine-chest-tricep",   // Monday: Chest & Triceps (Hypertrophy)
  2: "routine-back-bicep",     // Tuesday: Back & Biceps (Pull Split)
  3: null,                     // Wednesday: Rest Day (Active Recovery)
  4: "routine-shoulders-arms", // Thursday: Shoulders & Abs
  5: "routine-legs-calves",    // Friday: Legs & Calves (Lower Overload)
  6: "routine-push",           // Saturday: Push Day / Arm Blaster
  0: null,                     // Sunday: Rest Day (Cardio & Recovery)
};

function loadInitialState(): TrackerState {
  if (typeof window === "undefined") {
    return {
      hasCompletedOnboarding: true,
      restDays: [],
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      profile: DEFAULT_PROFILE,
      goals: [DEFAULT_GOAL],
      exercises: INITIAL_EXERCISES as Exercise[],
      foods: INITIAL_FOODS as Food[],
      routines: INITIAL_ROUTINES,
      sessions: [],
      foodLogs: [],
      waterLogs: [],
      weightLogs: [
        { id: "bw-1", user_id: "user-1", entry_date: "2026-10-10", weight_kg: 79.5, created_at: "2026-10-10T08:00:00Z" },
        { id: "bw-2", user_id: "user-1", entry_date: "2026-10-17", weight_kg: 79.1, created_at: "2026-10-17T08:00:00Z" },
        { id: "bw-3", user_id: "user-1", entry_date: "2026-10-24", weight_kg: 78.8, created_at: "2026-10-24T08:00:00Z" },
        { id: "bw-4", user_id: "user-1", entry_date: "2026-10-31", weight_kg: 78.5, created_at: "2026-10-31T08:00:00Z" },
      ],
      measurementLogs: [
        { id: "bm-1", user_id: "user-1", entry_date: "2026-10-25", waist_cm: 84, chest_cm: 102, arms_cm: 38, hips_cm: 98, thighs_cm: 58, created_at: "2026-10-25T09:00:00Z" }
      ],
    };
  }

  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}state`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (typeof parsed.hasCompletedOnboarding === "undefined") {
        parsed.hasCompletedOnboarding = true;
      }
      if (!Array.isArray(parsed.restDays)) {
        parsed.restDays = [];
      }
      if (Array.isArray(parsed.routines)) {
        const existingIds = new Set(parsed.routines.map((r: WorkoutRoutine) => r.id));
        INITIAL_ROUTINES.forEach((ir) => {
          if (!existingIds.has(ir.id)) {
            parsed.routines.push(ir);
          }
        });
      } else {
        parsed.routines = INITIAL_ROUTINES;
      }
      if (parsed.profile && !parsed.profile.theme_color) {
        parsed.profile.theme_color = "purple";
      }
      if (!parsed.weeklySchedule) {
        parsed.weeklySchedule = DEFAULT_WEEKLY_SCHEDULE;
      }
      return parsed;
    }
  } catch (e) {
    console.error("Error reading localStorage", e);
  }

  // Pre-seed default foods and initial demo items for today
  const today = formatDateToISO(new Date());
  const initialFoodLogs: FoodLog[] = [
    {
      id: "fl-1",
      user_id: "user-1",
      entry_date: today,
      meal_category: "breakfast",
      food_name_snapshot: "Whole Egg (Boiled)",
      quantity: 3,
      unit: "large (50g)",
      calories: 234,
      protein: 18.9,
      carbohydrates: 1.8,
      fat: 15.9,
      created_at: new Date().toISOString(),
    },
    {
      id: "fl-2",
      user_id: "user-1",
      entry_date: today,
      meal_category: "breakfast",
      food_name_snapshot: "Whole Wheat Bread Slice",
      quantity: 2,
      unit: "slice (30g)",
      calories: 150,
      protein: 7,
      carbohydrates: 26,
      fat: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: "fl-3",
      user_id: "user-1",
      entry_date: today,
      meal_category: "lunch",
      food_name_snapshot: "Cooked White Rice",
      quantity: 200,
      unit: "g",
      calories: 260,
      protein: 5.4,
      carbohydrates: 56.4,
      fat: 0.6,
      created_at: new Date().toISOString(),
    },
    {
      id: "fl-4",
      user_id: "user-1",
      entry_date: today,
      meal_category: "lunch",
      food_name_snapshot: "Chicken Breast (Cooked, Grilled)",
      quantity: 180,
      unit: "g",
      calories: 297,
      protein: 55.8,
      carbohydrates: 0,
      fat: 6.48,
      created_at: new Date().toISOString(),
    },
  ];

  const initialWaterLogs: WaterLog[] = [
    { id: "wl-1", user_id: "user-1", entry_date: today, amount_ml: 500, logged_at: "08:30", created_at: new Date().toISOString() },
    { id: "wl-2", user_id: "user-1", entry_date: today, amount_ml: 500, logged_at: "11:15", created_at: new Date().toISOString() },
    { id: "wl-3", user_id: "user-1", entry_date: today, amount_ml: 250, logged_at: "13:45", created_at: new Date().toISOString() },
  ];

  const freshState: TrackerState = {
    hasCompletedOnboarding: false,
    restDays: [],
    weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
    profile: DEFAULT_PROFILE,
    goals: [DEFAULT_GOAL],
    exercises: INITIAL_EXERCISES as Exercise[],
    foods: INITIAL_FOODS as Food[],
    routines: INITIAL_ROUTINES,
    sessions: [],
    foodLogs: initialFoodLogs,
    waterLogs: initialWaterLogs,
    weightLogs: [
      { id: "bw-1", user_id: "user-1", entry_date: "2026-10-10", weight_kg: 79.5, created_at: "2026-10-10T08:00:00Z" },
      { id: "bw-2", user_id: "user-1", entry_date: "2026-10-17", weight_kg: 79.1, created_at: "2026-10-17T08:00:00Z" },
      { id: "bw-3", user_id: "user-1", entry_date: "2026-10-24", weight_kg: 78.8, created_at: "2026-10-24T08:00:00Z" },
      { id: "bw-4", user_id: "user-1", entry_date: today, weight_kg: 78.5, created_at: new Date().toISOString() },
    ],
    measurementLogs: [
      { id: "bm-1", user_id: "user-1", entry_date: "2026-10-25", waist_cm: 84, chest_cm: 102, arms_cm: 38, hips_cm: 98, thighs_cm: 58, created_at: "2026-10-25T09:00:00Z" }
    ],
  };

  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}state`, JSON.stringify(freshState));
  } catch (e) {
    console.error("Error saving initial state", e);
  }

  return freshState;
}

export function useTrackerStore() {
  const [state, setState] = useState<TrackerState>(loadInitialState);
  const [isLoaded, setIsLoaded] = useState(false);
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "offline">("idle");

  const saveState = useCallback((newState: TrackerState) => {
    setState(newState);
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}state`, JSON.stringify(newState));
    } catch (e) {
      console.error("Error saving state to localStorage", e);
    }
  }, []);

  // Synchronize state with Supabase Cloud
  const syncWithCloud = useCallback(async (user: any, baseState: TrackerState) => {
    if (!user || !user.id) return;
    setIsSyncing(true);
    setSyncStatus("syncing");

    try {
      // 1. Profile sync
      let profile = await fetchProfile(user.id);
      if (!profile) {
        // User just registered: create initial profile in Supabase
        const initialProfileData: Partial<Profile> & { id: string } = {
          id: user.id,
          display_name: user.user_metadata?.display_name || baseState.profile.display_name || "Athlete",
          fitness_goal: baseState.profile.fitness_goal || "maintain_weight",
          sex: baseState.profile.sex || "male",
          height_cm: baseState.profile.height_cm || 178,
          latest_weight_kg: baseState.profile.latest_weight_kg || 78.5,
          timezone: baseState.profile.timezone || "Asia/Kolkata",
          theme_color: baseState.profile.theme_color || "purple",
        };
        profile = await upsertProfile(initialProfileData);
      }

      // 2. Goal sync
      let remoteGoals = await fetchFitnessGoals(user.id);
      if (remoteGoals.length === 0) {
        const currentGoal = baseState.goals[0] || DEFAULT_GOAL;
        const newGoal = await upsertFitnessGoal({
          user_id: user.id,
          calorie_target: currentGoal.calorie_target,
          protein_grams: currentGoal.protein_grams,
          carbs_grams: currentGoal.carbs_grams,
          fat_grams: currentGoal.fat_grams,
          water_ml: currentGoal.water_ml,
          workouts_per_week: currentGoal.workouts_per_week,
        });
        if (newGoal) remoteGoals = [newGoal];
      }

      // 3. Parallel fetch user data
      const [
        remoteFoodLogs,
        remoteWaterLogs,
        remoteWeightLogs,
        remoteMeasurementLogs,
        remoteSessions,
        remoteExercises,
        remoteFoods,
        remoteRoutines,
      ] = await Promise.all([
        fetchFoodLogs(user.id),
        fetchWaterLogs(user.id),
        fetchWeightLogs(user.id),
        fetchMeasurementLogs(user.id),
        fetchWorkoutSessions(user.id),
        fetchExercises(user.id),
        fetchFoods(user.id),
        fetchWorkoutRoutines(user.id),
      ]);

      // If user had local food logs and remote is empty, migrate them up to Supabase
      if (remoteFoodLogs.length === 0 && baseState.foodLogs.length > 0) {
        for (const fl of baseState.foodLogs) {
          await supabaseInsertFoodLog({
            user_id: user.id,
            entry_date: fl.entry_date,
            meal_category: fl.meal_category,
            food_name_snapshot: fl.food_name_snapshot,
            quantity: fl.quantity,
            unit: fl.unit,
            calories: fl.calories,
            protein: fl.protein,
            carbohydrates: fl.carbohydrates,
            fat: fl.fat,
            notes: fl.notes,
          });
        }
      }

      // Assemble merged state
      const mergedState: TrackerState = {
        ...baseState,
        hasCompletedOnboarding: true,
        profile: profile || baseState.profile,
        goals: remoteGoals.length > 0 ? remoteGoals : baseState.goals,
        foodLogs: remoteFoodLogs.length > 0 ? remoteFoodLogs : baseState.foodLogs,
        waterLogs: remoteWaterLogs.length > 0 ? remoteWaterLogs : baseState.waterLogs,
        weightLogs: remoteWeightLogs.length > 0 ? remoteWeightLogs : baseState.weightLogs,
        measurementLogs: remoteMeasurementLogs.length > 0 ? remoteMeasurementLogs : baseState.measurementLogs,
        sessions: remoteSessions.length > 0 ? remoteSessions : baseState.sessions,
        routines: remoteRoutines.length > 0 ? remoteRoutines : baseState.routines,
        exercises: remoteExercises.length > 0 ? remoteExercises : baseState.exercises,
        foods: remoteFoods.length > 0 ? remoteFoods : baseState.foods,
      };

      saveState(mergedState);
      setSyncStatus("synced");
    } catch (err) {
      console.error("Cloud sync error:", err);
      setSyncStatus("offline");
    } finally {
      setIsSyncing(false);
    }
  }, [saveState]);

  // Initial mount: load local storage + connect Supabase Auth listener
  useEffect(() => {
    const loaded = loadInitialState();
    setState(loaded);
    setIsLoaded(true);

    if (!isSupabaseConfigured()) {
      setSyncStatus("offline");
      return;
    }

    const supabase = createClient();
    if (!supabase) return;

    // Check existing session
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session;
      if (session?.user) {
        setAuthUser(session.user);
        syncWithCloud(session.user, loaded);
      } else {
        setSyncStatus("offline");
      }
    });

    // Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (event === "SIGNED_IN" && session?.user) {
        setAuthUser(session.user);
        await syncWithCloud(session.user, loaded);
      } else if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setSyncStatus("offline");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithCloud]);

  // Auth actions
  const signOut = async () => {
    await supabaseSignOut();
    setAuthUser(null);
    setSyncStatus("offline");
  };

  const refreshCloudSync = async () => {
    if (authUser) {
      await syncWithCloud(authUser, state);
    }
  };

  // Profile & Goals
  const updateProfile = (profileUpdates: Partial<Profile>) => {
    const updated = { ...state.profile, ...profileUpdates, updated_at: new Date().toISOString() };
    saveState({ ...state, profile: updated });

    if (authUser) {
      upsertProfile({
        id: authUser.id,
        ...profileUpdates,
      }).catch((e) => console.error("Error upserting profile:", e));
    }
  };

  const updateGoal = (goalUpdates: Partial<FitnessGoal>) => {
    const current = state.goals[0] || DEFAULT_GOAL;
    const updated: FitnessGoal = { ...current, ...goalUpdates };
    saveState({ ...state, goals: [updated] });

    if (authUser) {
      const { user_id: _, ...goalData } = updated;
      upsertFitnessGoal({
        ...goalData,
        user_id: authUser.id,
      }).catch((e) => console.error("Error upserting goal:", e));
    }
  };

  const completeOnboarding = (data: {
    profile: Partial<Profile>;
    goal: Partial<FitnessGoal>;
    initialWeightKg: number;
  }) => {
    const today = formatDateToISO(new Date());
    const updatedProfile: Profile = {
      ...state.profile,
      ...data.profile,
      latest_weight_kg: data.initialWeightKg,
      updated_at: new Date().toISOString(),
    };

    const currentGoal = state.goals[0] || DEFAULT_GOAL;
    const updatedGoal: FitnessGoal = {
      ...currentGoal,
      ...data.goal,
      effective_from: today,
    };

    const initialWeightEntry: BodyWeightLog = {
      id: generateUUID(),
      user_id: authUser ? authUser.id : state.profile.id,
      entry_date: today,
      weight_kg: data.initialWeightKg,
      notes: "Initial weight from onboarding",
      created_at: new Date().toISOString(),
    };

    saveState({
      ...state,
      hasCompletedOnboarding: true,
      profile: updatedProfile,
      goals: [updatedGoal],
      weightLogs: [initialWeightEntry, ...state.weightLogs.filter((w) => w.entry_date !== today)],
    });

    if (authUser) {
      upsertProfile({
        id: authUser.id,
        ...data.profile,
        latest_weight_kg: data.initialWeightKg,
      }).catch((e) => console.error("Error during completeOnboarding profile sync:", e));

      const { user_id: _gUid, ...onboardingGoalData } = updatedGoal;
      upsertFitnessGoal({
        ...onboardingGoalData,
        user_id: authUser.id,
      }).catch((e) => console.error("Error during completeOnboarding goal sync:", e));

      supabaseInsertWeightLog({
        user_id: authUser.id,
        entry_date: today,
        weight_kg: data.initialWeightKg,
        notes: "Initial weight from onboarding",
      }).catch((e) => console.error("Error during completeOnboarding weight sync:", e));
    }
  };

  const resetOnboarding = () => {
    saveState({
      ...state,
      hasCompletedOnboarding: false,
    });
  };

  // Rest Day Toggle
  const toggleRestDay = (entryDate: string) => {
    const isRest = (state.restDays || []).includes(entryDate);
    const updated = isRest
      ? (state.restDays || []).filter((d) => d !== entryDate)
      : [...(state.restDays || []), entryDate];
    saveState({ ...state, restDays: updated });
  };

  // Water Actions
  const addWater = (entryDate: string, amountMl: number) => {
    const newId = generateUUID();
    const newLog: WaterLog = {
      id: newId,
      user_id: authUser ? authUser.id : state.profile.id,
      entry_date: entryDate,
      amount_ml: amountMl,
      logged_at: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      created_at: new Date().toISOString(),
    };
    saveState({ ...state, waterLogs: [newLog, ...state.waterLogs] });

    if (authUser) {
      supabaseInsertWaterLog({
        user_id: authUser.id,
        entry_date: entryDate,
        amount_ml: amountMl,
      }).catch((e) => console.error("Error syncing water log:", e));
    }
  };

  const deleteWaterLog = (id: string) => {
    saveState({
      ...state,
      waterLogs: state.waterLogs.filter((w) => w.id !== id),
    });

    if (authUser) {
      supabaseDeleteWaterLog(id).catch((e) => console.error("Error deleting water log:", e));
    }
  };

  // Food Log Actions
  const addFoodLog = (log: Omit<FoodLog, "id" | "user_id" | "created_at">) => {
    const newId = generateUUID();
    const newLog: FoodLog = {
      ...log,
      id: newId,
      user_id: authUser ? authUser.id : state.profile.id,
      created_at: new Date().toISOString(),
    };
    saveState({ ...state, foodLogs: [newLog, ...state.foodLogs] });

    if (authUser) {
      supabaseInsertFoodLog({
        user_id: authUser.id,
        entry_date: log.entry_date,
        meal_category: log.meal_category,
        food_name_snapshot: log.food_name_snapshot,
        quantity: log.quantity,
        unit: log.unit,
        calories: log.calories,
        protein: log.protein,
        carbohydrates: log.carbohydrates,
        fat: log.fat,
        notes: log.notes,
      }).catch((e) => console.error("Error syncing food log:", e));
    }
  };

  const deleteFoodLog = (id: string) => {
    saveState({
      ...state,
      foodLogs: state.foodLogs.filter((f) => f.id !== id),
    });

    if (authUser) {
      supabaseDeleteFoodLog(id).catch((e) => console.error("Error deleting food log:", e));
    }
  };

  const copyMealsFromDate = (
    sourceDate: string,
    targetDate: string,
    categories?: MealCategory[]
  ) => {
    const sourceLogs = state.foodLogs.filter((f) => {
      const dateMatch = f.entry_date === sourceDate;
      const catMatch = !categories || categories.length === 0 || categories.includes(f.meal_category);
      return dateMatch && catMatch;
    });

    if (sourceLogs.length === 0) return 0;

    const duplicatedLogs: FoodLog[] = sourceLogs.map((log) => ({
      ...log,
      id: generateUUID(),
      entry_date: targetDate,
      created_at: new Date().toISOString(),
    }));

    saveState({
      ...state,
      foodLogs: [...duplicatedLogs, ...state.foodLogs],
    });

    if (authUser) {
      duplicatedLogs.forEach((dl) => {
        supabaseInsertFoodLog({
          user_id: authUser.id,
          entry_date: dl.entry_date,
          meal_category: dl.meal_category,
          food_name_snapshot: dl.food_name_snapshot,
          quantity: dl.quantity,
          unit: dl.unit,
          calories: dl.calories,
          protein: dl.protein,
          carbohydrates: dl.carbohydrates,
          fat: dl.fat,
          notes: dl.notes,
        }).catch((e) => console.error("Error duplicating food log to cloud:", e));
      });
    }

    return duplicatedLogs.length;
  };

  // Custom Food Library
  const addCustomFood = (food: Omit<Food, "id" | "user_id" | "created_at">) => {
    const newFood: Food = {
      ...food,
      id: generateUUID(),
      user_id: authUser ? authUser.id : state.profile.id,
      created_at: new Date().toISOString(),
    };
    saveState({ ...state, foods: [newFood, ...state.foods] });
  };

  // Body Weight
  const addWeightLog = (entryDate: string, weightKg: number, notes?: string) => {
    const newLog: BodyWeightLog = {
      id: generateUUID(),
      user_id: authUser ? authUser.id : state.profile.id,
      entry_date: entryDate,
      weight_kg: weightKg,
      notes,
      created_at: new Date().toISOString(),
    };
    const updatedProfile = {
      ...state.profile,
      latest_weight_kg: weightKg,
      updated_at: new Date().toISOString(),
    };
    saveState({
      ...state,
      profile: updatedProfile,
      weightLogs: [newLog, ...state.weightLogs.filter((w) => w.entry_date !== entryDate)],
    });

    if (authUser) {
      supabaseInsertWeightLog({
        user_id: authUser.id,
        entry_date: entryDate,
        weight_kg: weightKg,
        notes,
      }).catch((e) => console.error("Error syncing weight log:", e));

      upsertProfile({
        id: authUser.id,
        latest_weight_kg: weightKg,
      }).catch((e) => console.error("Error updating profile weight:", e));
    }
  };

  // Body Measurements
  const addMeasurementLog = (entryDate: string, measurements: Partial<BodyMeasurementLog>) => {
    const newLog: BodyMeasurementLog = {
      id: generateUUID(),
      user_id: authUser ? authUser.id : state.profile.id,
      entry_date: entryDate,
      ...measurements,
      created_at: new Date().toISOString(),
    };
    saveState({
      ...state,
      measurementLogs: [newLog, ...state.measurementLogs.filter((m) => m.entry_date !== entryDate)],
    });

    if (authUser) {
      supabaseInsertMeasurementLog({
        user_id: authUser.id,
        entry_date: entryDate,
        ...measurements,
      }).catch((e) => console.error("Error syncing measurement log:", e));
    }
  };

  // Custom Routine Management
  const addRoutine = (routine: {
    name: string;
    description?: string | null;
    exercises?: Array<Omit<RoutineExercise, "id" | "routine_id" | "created_at">>;
  }) => {
    const routineId = generateUUID();
    const newRoutine: WorkoutRoutine = {
      ...routine,
      id: routineId,
      user_id: authUser ? authUser.id : state.profile.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      exercises: (routine.exercises || []).map((re, idx) => ({
        exercise_id: re.exercise_id,
        order_index: re.order_index ?? idx,
        target_sets: re.target_sets,
        target_reps: re.target_reps,
        target_weight_kg: re.target_weight_kg,
        rest_seconds: re.rest_seconds ?? 90,
        notes: re.notes,
        id: generateUUID(),
        routine_id: routineId,
        created_at: new Date().toISOString(),
      })),
    };
    saveState({ ...state, routines: [...state.routines, newRoutine] });

    if (authUser) {
      supabaseUpsertRoutine(newRoutine).catch((e) => console.error("Error upserting routine to cloud:", e));
    }

    return newRoutine;
  };

  const deleteRoutine = (routineId: string) => {
    saveState({
      ...state,
      routines: state.routines.filter((r) => r.id !== routineId),
    });

    if (authUser) {
      supabaseDeleteRoutine(routineId).catch((e) => console.error("Error deleting routine:", e));
    }
  };

  // Weekly Schedule Action
  const updateWeeklySchedule = (dayIndex: number, routineId: string | null) => {
    saveState({
      ...state,
      weeklySchedule: {
        ...(state.weeklySchedule || DEFAULT_WEEKLY_SCHEDULE),
        [dayIndex]: routineId,
      },
    });
  };

  // Workout Session Actions
  const startWorkout = (
    routineId?: string,
    customName?: string,
    customExercises?: Array<{
      exercise_id: string;
      target_sets: number;
      target_reps: string;
      target_weight_kg?: number | null;
      sets?: Array<{
        setNumber: number;
        type: WorkoutSetType | "drop";
        weight: number;
        reps: number;
      }>;
    }>
  ) => {
    const routine = state.routines.find((r) => r.id === routineId);
    const sessionName = customName || (routine ? routine.name : "Workout Session");
    const sessionId = generateUUID();
    const entryDate = formatDateToISO(new Date());

    const initialSets: WorkoutSet[] = [];
    if (customExercises && customExercises.length > 0) {
      customExercises.forEach((ce) => {
        if (ce.sets && ce.sets.length > 0) {
          ce.sets.forEach((s) => {
            const mappedType: WorkoutSetType = s.type === "drop" ? "dropset" : s.type;
            initialSets.push({
              id: generateUUID(),
              session_id: sessionId,
              exercise_id: ce.exercise_id,
              set_number: s.setNumber,
              reps: s.reps,
              weight_kg: s.weight,
              set_type: mappedType,
              is_completed: false,
              created_at: new Date().toISOString(),
            });
          });
        } else {
          for (let s = 1; s <= ce.target_sets; s++) {
            initialSets.push({
              id: generateUUID(),
              session_id: sessionId,
              exercise_id: ce.exercise_id,
              set_number: s,
              reps: parseInt(ce.target_reps) || 10,
              weight_kg: ce.target_weight_kg || 0,
              set_type: "normal",
              is_completed: false,
              created_at: new Date().toISOString(),
            });
          }
        }
      });
    } else if (routine && routine.exercises) {
      routine.exercises.forEach((re) => {
        for (let s = 1; s <= re.target_sets; s++) {
          initialSets.push({
            id: generateUUID(),
            session_id: sessionId,
            exercise_id: re.exercise_id,
            set_number: s,
            reps: parseInt(re.target_reps) || 10,
            weight_kg: re.target_weight_kg || 0,
            set_type: "normal",
            is_completed: false,
            created_at: new Date().toISOString(),
          });
        }
      });
    }

    const newSession: WorkoutSession = {
      id: sessionId,
      user_id: authUser ? authUser.id : state.profile.id,
      routine_id: routineId || null,
      name: sessionName,
      entry_date: entryDate,
      status: "in_progress",
      started_at: new Date().toISOString(),
      sets: initialSets,
      created_at: new Date().toISOString(),
    };

    saveState({
      ...state,
      sessions: [newSession, ...state.sessions.filter((s) => s.status !== "in_progress")],
    });

    return newSession;
  };

  const updateWorkoutSet = (
    sessionId: string,
    setId: string,
    updates: Partial<WorkoutSet>
  ) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId || !session.sets) return session;
      const updatedSets = session.sets.map((set) =>
        set.id === setId ? { ...set, ...updates } : set
      );
      return { ...session, sets: updatedSets };
    });
    saveState({ ...state, sessions: updatedSessions });
  };

  const addSetToSession = (sessionId: string, exerciseId: string) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      const sets = session.sets || [];
      const exerciseSets = sets.filter((s) => s.exercise_id === exerciseId);
      const nextSetNum = exerciseSets.length + 1;
      const lastSet = exerciseSets[exerciseSets.length - 1];

      const newSet: WorkoutSet = {
        id: generateUUID(),
        session_id: sessionId,
        exercise_id: exerciseId,
        set_number: nextSetNum,
        reps: lastSet ? lastSet.reps : 10,
        weight_kg: lastSet ? lastSet.weight_kg : 0,
        set_type: "normal",
        is_completed: false,
        created_at: new Date().toISOString(),
      };
      return { ...session, sets: [...sets, newSet] };
    });
    saveState({ ...state, sessions: updatedSessions });
  };

  const addExerciseToSession = (
    sessionId: string,
    exerciseId: string,
    initialSetsCount = 3,
    targetWeight = 20,
    targetReps = 10
  ) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      const sets = session.sets || [];
      const newSets: WorkoutSet[] = [];
      for (let s = 1; s <= initialSetsCount; s++) {
        newSets.push({
          id: generateUUID(),
          session_id: sessionId,
          exercise_id: exerciseId,
          set_number: s,
          reps: targetReps,
          weight_kg: targetWeight,
          set_type: s === 1 ? "warmup" : "normal",
          is_completed: false,
          created_at: new Date().toISOString(),
        });
      }
      return { ...session, sets: [...sets, ...newSets] };
    });
    saveState({ ...state, sessions: updatedSessions });
  };

  const deleteSetFromSession = (sessionId: string, setId: string) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId || !session.sets) return session;
      const filtered = session.sets.filter((s) => s.id !== setId);
      const exerciseId = session.sets.find((s) => s.id === setId)?.exercise_id;
      if (!exerciseId) return { ...session, sets: filtered };

      let counter = 1;
      const renumbered = filtered.map((s) => {
        if (s.exercise_id === exerciseId) {
          return { ...s, set_number: counter++ };
        }
        return s;
      });

      return { ...session, sets: renumbered };
    });
    saveState({ ...state, sessions: updatedSessions });
  };

  const removeExerciseFromSession = (sessionId: string, exerciseId: string) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId || !session.sets) return session;
      return {
        ...session,
        sets: session.sets.filter((s) => s.exercise_id !== exerciseId),
      };
    });
    saveState({ ...state, sessions: updatedSessions });
  };

  const finishWorkout = (sessionId: string, notes?: string) => {
    let completedSession: WorkoutSession | null = null;

    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      const completedAt = new Date().toISOString();
      const startTime = new Date(session.started_at).getTime();
      const durationSeconds = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      completedSession = {
        ...session,
        status: "completed" as const,
        completed_at: completedAt,
        duration_seconds: durationSeconds,
        notes: notes || session.notes,
      };
      return completedSession;
    });

    saveState({ ...state, sessions: updatedSessions });

    if (authUser && completedSession) {
      const sess: WorkoutSession = completedSession;
      supabaseSaveWorkoutSession(
        {
          id: sess.id,
          user_id: authUser.id,
          routine_id: sess.routine_id,
          name: sess.name,
          entry_date: sess.entry_date,
          status: sess.status,
          started_at: sess.started_at,
          completed_at: sess.completed_at,
          duration_seconds: sess.duration_seconds,
          notes: sess.notes,
        },
        (sess.sets || []).map((s) => ({
          session_id: sess.id,
          exercise_id: s.exercise_id,
          set_number: s.set_number,
          set_type: s.set_type,
          weight_kg: s.weight_kg,
          reps: s.reps,
          is_completed: s.is_completed,
        }))
      ).catch((e) => console.error("Error saving workout session to Supabase:", e));
    }
  };

  const discardWorkout = (sessionId: string) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      return { ...session, status: "discarded" as const };
    });
    saveState({ ...state, sessions: updatedSessions });

    if (authUser) {
      supabaseDeleteWorkoutSession(sessionId).catch((e) =>
        console.error("Error deleting session:", e)
      );
    }
  };

  // Queries
  const activeWorkout = state.sessions.find((s) => s.status === "in_progress");

  const getDailyTotals = (entryDate: string) => {
    const dayFoods = state.foodLogs.filter((f) => f.entry_date === entryDate);
    const dayWater = state.waterLogs.filter((w) => w.entry_date === entryDate);
    const dayWorkouts = state.sessions.filter(
      (s) => s.entry_date === entryDate && s.status === "completed"
    );

    const caloriesConsumed = dayFoods.reduce((acc, f) => acc + f.calories, 0);
    const proteinConsumed = dayFoods.reduce((acc, f) => acc + f.protein, 0);
    const carbsConsumed = dayFoods.reduce((acc, f) => acc + f.carbohydrates, 0);
    const fatConsumed = dayFoods.reduce((acc, f) => acc + f.fat, 0);
    const waterConsumed = dayWater.reduce((acc, w) => acc + w.amount_ml, 0);

    const goal = state.goals[0] || DEFAULT_GOAL;
    const caloriesRemaining = goal.calorie_target - caloriesConsumed;
    const isRestDay = (state.restDays || []).includes(entryDate);

    return {
      caloriesConsumed,
      caloriesRemaining,
      proteinConsumed,
      carbsConsumed,
      fatConsumed,
      waterConsumed,
      completedWorkoutsCount: dayWorkouts.length,
      isRestDay,
      goal,
    };
  };

  return {
    isLoaded,
    hasCompletedOnboarding: state.hasCompletedOnboarding,
    state,
    authUser,
    isSyncing,
    syncStatus,
    activeWorkout,
    signOut,
    refreshCloudSync,
    completeOnboarding,
    resetOnboarding,
    updateProfile,
    updateGoal,
    updateWeeklySchedule,
    toggleRestDay,
    addWater,
    deleteWaterLog,
    addFoodLog,
    deleteFoodLog,
    copyMealsFromDate,
    addCustomFood,
    addWeightLog,
    addMeasurementLog,
    addRoutine,
    deleteRoutine,
    startWorkout,
    updateWorkoutSet,
    addSetToSession,
    addExerciseToSession,
    deleteSetFromSession,
    removeExerciseFromSession,
    finishWorkout,
    discardWorkout,
    getDailyTotals,
  };
}
