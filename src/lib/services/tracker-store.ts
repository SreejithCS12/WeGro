"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { formatDateToISO, generateUUID, isValidUUID } from "@/lib/utils";
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
import { syncQueue, SyncQueueState } from "@/lib/services/sync-queue";
import { createClient } from "@/lib/supabase/client";
import { applyTheme, getStoredTheme } from "@/lib/theme";

const STORAGE_KEY_PREFIX = "pft_v2_";

const DEFAULT_PROFILE: Profile = {
  id: "user-1",
  display_name: "Athlete",
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
  restDays: string[];
  weeklySchedule: Record<number, string | null>;
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

function getStorageKey(userId?: string): string {
  return `${STORAGE_KEY_PREFIX}state_${userId || "user"}`;
}

function resolveExerciseUUID(exerciseId: string, exercisesList: Exercise[]): string {
  if (isValidUUID(exerciseId)) return exerciseId;
  const found = exercisesList.find((e) => e.id === exerciseId);
  if (found && isValidUUID(found.id)) return found.id;
  if (found) {
    const byName = exercisesList.find(
      (e) => e.name.toLowerCase() === found.name.toLowerCase() && isValidUUID(e.id)
    );
    if (byName) return byName.id;
  }
  return generateUUID();
}

function loadInitialState(userId?: string): TrackerState {
  if (typeof window === "undefined" || !userId) {
    return {
      hasCompletedOnboarding: false,
      restDays: [],
      weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
      profile: { ...DEFAULT_PROFILE, id: userId || "" },
      goals: [{ ...DEFAULT_GOAL, user_id: userId || "" }],
      exercises: INITIAL_EXERCISES as Exercise[],
      foods: INITIAL_FOODS as Food[],
      routines: INITIAL_ROUTINES,
      sessions: [],
      foodLogs: [],
      waterLogs: [],
      weightLogs: [],
      measurementLogs: [],
    };
  }

  const primaryKey = getStorageKey(userId);
  const fallbackKey = "pft_v1_state";

  try {
    const raw = localStorage.getItem(primaryKey) || localStorage.getItem(fallbackKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        hasCompletedOnboarding: parsed.hasCompletedOnboarding ?? false,
        restDays: Array.isArray(parsed.restDays) ? parsed.restDays : [],
        weeklySchedule: parsed.weeklySchedule || DEFAULT_WEEKLY_SCHEDULE,
        profile: parsed.profile ? { ...DEFAULT_PROFILE, ...parsed.profile, id: userId } : { ...DEFAULT_PROFILE, id: userId },
        goals: Array.isArray(parsed.goals) && parsed.goals.length > 0 ? parsed.goals : [{ ...DEFAULT_GOAL, user_id: userId }],
        exercises: Array.isArray(parsed.exercises) && parsed.exercises.length > 0 ? parsed.exercises : (INITIAL_EXERCISES as Exercise[]),
        foods: (() => {
          const cached = Array.isArray(parsed.foods) ? (parsed.foods as Food[]) : [];
          const existingNames = new Set(cached.map((f) => f.name.toLowerCase()));
          const existingIds = new Set(cached.map((f) => f.id));
          const merged = [...cached];
          (INITIAL_FOODS as Food[]).forEach((f) => {
            if (!existingNames.has(f.name.toLowerCase()) && !existingIds.has(f.id)) {
              merged.push(f);
            }
          });
          // Ensure all IDs are strictly unique
          const seenIds = new Set<string>();
          const deduped: Food[] = [];
          merged.forEach((item) => {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              deduped.push(item);
            }
          });
          return deduped.length > 0 ? deduped : (INITIAL_FOODS as Food[]);
        })(),
        routines: Array.isArray(parsed.routines) && parsed.routines.length > 0 ? parsed.routines : INITIAL_ROUTINES,
        sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        foodLogs: Array.isArray(parsed.foodLogs) ? parsed.foodLogs : [],
        waterLogs: Array.isArray(parsed.waterLogs) ? parsed.waterLogs : [],
        weightLogs: Array.isArray(parsed.weightLogs) ? parsed.weightLogs : [],
        measurementLogs: Array.isArray(parsed.measurementLogs) ? parsed.measurementLogs : [],
      };
    }
  } catch (e) {
    console.error("Error reading localStorage", e);
  }

  return {
    hasCompletedOnboarding: false,
    restDays: [],
    weeklySchedule: DEFAULT_WEEKLY_SCHEDULE,
    profile: { ...DEFAULT_PROFILE, id: userId },
    goals: [{ ...DEFAULT_GOAL, user_id: userId }],
    exercises: INITIAL_EXERCISES as Exercise[],
    foods: INITIAL_FOODS as Food[],
    routines: INITIAL_ROUTINES,
    sessions: [],
    foodLogs: [],
    waterLogs: [],
    weightLogs: [],
    measurementLogs: [],
  };
}

export function useTrackerStore() {
  const [state, setState] = useState<TrackerState>(() => loadInitialState());
  const [isLoaded, setIsLoaded] = useState(false);
  const [authUser, setAuthUser] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "offline">("idle");
  const [syncQueueState, setSyncQueueState] = useState<SyncQueueState>(() => syncQueue.getState());

  useEffect(() => {
    const unsubscribe = syncQueue.subscribe((qState) => {
      setSyncQueueState(qState);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    syncQueue.setUser(authUser);
  }, [authUser]);

  const stateRef = useRef(state);
  stateRef.current = state;
  const authUserRef = useRef(authUser);
  authUserRef.current = authUser;

  const saveState = useCallback((newState: TrackerState, userId?: string) => {
    setState(newState);
    if (typeof window !== "undefined") {
      try {
        const uid = userId || authUserRef.current?.id;
        localStorage.setItem(getStorageKey(uid), JSON.stringify(newState));
      } catch (e) {
        console.error("Error saving state to localStorage", e);
      }
    }
  }, []);

  // Synchronize state with Supabase Cloud
  const syncWithCloud = useCallback(async (user: any, baseState: TrackerState) => {
    if (!user || !user.id) return;
    setIsSyncing(true);
    setSyncStatus("syncing");

    try {
      // Flush offline sync queue first so local edits are saved remotely before fetching
      await syncQueue.processQueue();

      // 1. Profile sync
      let profile = await fetchProfile(user.id);
      if (!profile) {
        // User just registered: initialize basic profile in Supabase
        const initialProfileData = {
          id: user.id,
          display_name: user.user_metadata?.display_name || baseState.profile.display_name || "Athlete",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata",
          preferred_units: "metric",
        };
        profile = await upsertProfile(initialProfileData);
      }

      // 2. Goal sync
      let remoteGoals = await fetchFitnessGoals(user.id);

      // Determine if this user has already completed onboarding
      const isAlreadyOnboarded = Boolean(
        user.user_metadata?.has_completed_onboarding ||
        (profile && profile.height_cm && remoteGoals.length > 0)
      );

      // If user is already onboarded but has no goal row (rare), create fallback
      if (isAlreadyOnboarded && remoteGoals.length === 0) {
        const currentGoal = baseState.goals[0] || DEFAULT_GOAL;
        const newGoal = await upsertFitnessGoal({
          user_id: user.id,
          calorie_target: currentGoal.calorie_target,
          protein_grams: currentGoal.protein_grams,
          carbs_grams: currentGoal.carbs_grams,
          fat_grams: currentGoal.fat_grams,
          water_ml: currentGoal.water_ml,
          workouts_per_week: currentGoal.workouts_per_week,
          effective_from: new Date().toISOString().split("T")[0],
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

      // Merge exercises: Supabase library exercises + fallback seeds
      const mergedExercises = [...remoteExercises];
      const existingExNames = new Set(remoteExercises.map((e) => e.name.toLowerCase()));
      INITIAL_EXERCISES.forEach((ie) => {
        if (!existingExNames.has(ie.name.toLowerCase())) {
          mergedExercises.push(ie as Exercise);
        }
      });

      // Merge foods: Supabase foods + default foods
      const mergedFoods = [...remoteFoods];
      const existingFoodNames = new Set(remoteFoods.map((f) => f.name.toLowerCase()));
      const existingFoodIds = new Set(remoteFoods.map((f) => f.id));
      INITIAL_FOODS.forEach((ifo) => {
        if (!existingFoodNames.has(ifo.name.toLowerCase()) && !existingFoodIds.has(ifo.id)) {
          mergedFoods.push(ifo as Food);
        }
      });
      // Deduplicate foods by ID to guarantee uniqueness
      const seenFoodIds = new Set<string>();
      const dedupedFoods: Food[] = [];
      mergedFoods.forEach((f) => {
        if (!seenFoodIds.has(f.id)) {
          seenFoodIds.add(f.id);
          dedupedFoods.push(f);
        }
      });

      // Merge routines: built-in template routines + user's cloud routines
      const mergedRoutines = [...INITIAL_ROUTINES];
      const builtInRoutineIds = new Set(INITIAL_ROUTINES.map((r) => r.id));
      remoteRoutines.forEach((rr) => {
        if (!builtInRoutineIds.has(rr.id)) {
          mergedRoutines.push(rr);
        }
      });

      // Determine latest recorded weight from cloud logs
      const sortedWeights = [...remoteWeightLogs].sort((a, b) => a.entry_date.localeCompare(b.entry_date));
      const latestLoggedWeight = sortedWeights.length > 0 ? sortedWeights[sortedWeights.length - 1].weight_kg : null;
      const effectiveWeight = latestLoggedWeight ?? profile?.latest_weight_kg ?? baseState.profile.latest_weight_kg ?? 78.5;

      // Determine effective theme from cloud (profiles table or auth user_metadata), with fallback to local state
      const cloudTheme = (profile as any)?.theme_color || user.user_metadata?.theme_color;
      const effectiveTheme = cloudTheme || baseState.profile.theme_color || getStoredTheme() || "purple";

      // Assemble merged state: For an authenticated user, Supabase is the single source of truth.
      const mergedState: TrackerState = {
        ...baseState,
        hasCompletedOnboarding: isAlreadyOnboarded,
        profile: {
          ...(profile || baseState.profile),
          display_name: profile?.display_name || user.user_metadata?.display_name || baseState.profile.display_name || "Athlete",
          latest_weight_kg: effectiveWeight,
          theme_color: effectiveTheme,
        },
        goals: remoteGoals.length > 0 ? remoteGoals : baseState.goals,
        foodLogs: remoteFoodLogs,
        waterLogs: remoteWaterLogs,
        weightLogs: remoteWeightLogs,
        measurementLogs: remoteMeasurementLogs,
        sessions: remoteSessions,
        routines: mergedRoutines,
        exercises: mergedExercises,
        foods: dedupedFoods,
      };

      saveState(mergedState, user.id);
      applyTheme(effectiveTheme);
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
    if (!isSupabaseConfigured()) {
      const loaded = loadInitialState();
      setState(loaded);
      setIsLoaded(true);
      setSyncStatus("offline");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setIsLoaded(true);
      return;
    }

    // Check existing session
    supabase.auth.getSession().then((res: any) => {
      const session = res?.data?.session;
      if (session?.user) {
        setAuthUser(session.user);
        const userState = loadInitialState(session.user.id);
        setState(userState);
        setIsLoaded(true);
        syncWithCloud(session.user, userState);
      } else {
        setAuthUser(null);
        setState(loadInitialState());
        setIsLoaded(true);
        setSyncStatus("offline");
      }
    });

    // Listen to Auth State Changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session?.user) {
        setAuthUser(session.user);
        const userState = loadInitialState(session.user.id);
        setState(userState);
        await syncWithCloud(session.user, userState);
      } else if (event === "SIGNED_OUT") {
        setAuthUser(null);
        setSyncStatus("offline");
        setState(loadInitialState());
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncWithCloud]);

  // Realtime subscription and window focus listener for multi-device sync
  useEffect(() => {
    if (!authUser || !isSupabaseConfigured()) return;
    const supabase = createClient();
    if (!supabase) return;

    // Realtime channel for live updates when another device mutates data
    const channel = supabase
      .channel(`sync_${authUser.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "food_logs", filter: `user_id=eq.${authUser.id}` },
        async () => {
          const fresh = await fetchFoodLogs(authUser.id);
          setState((prev) => {
            const next = { ...prev, foodLogs: fresh };
            saveState(next, authUser.id);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "water_logs", filter: `user_id=eq.${authUser.id}` },
        async () => {
          const fresh = await fetchWaterLogs(authUser.id);
          setState((prev) => {
            const next = { ...prev, waterLogs: fresh };
            saveState(next, authUser.id);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "body_weight_logs", filter: `user_id=eq.${authUser.id}` },
        async () => {
          const fresh = await fetchWeightLogs(authUser.id);
          setState((prev) => {
            const next = { ...prev, weightLogs: fresh };
            saveState(next, authUser.id);
            return next;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workout_sessions", filter: `user_id=eq.${authUser.id}` },
        async () => {
          const fresh = await fetchWorkoutSessions(authUser.id);
          setState((prev) => {
            const next = { ...prev, sessions: fresh };
            saveState(next, authUser.id);
            return next;
          });
        }
      )
      .subscribe();

    // Re-sync whenever the window regains focus (e.g. user switches tabs or wakes device)
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        syncWithCloud(authUser, stateRef.current);
      }
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("visibilitychange", handleFocus);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("visibilitychange", handleFocus);
    };
  }, [authUser, syncWithCloud, saveState]);

  // Auth actions
  const signOut = async () => {
    await supabaseSignOut();
    syncQueue.clearQueue();
    const currentUid = authUserRef.current?.id;
    setAuthUser(null);
    setSyncStatus("offline");
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(getStorageKey(currentUid));
        localStorage.removeItem("pft_v1_state");
      } catch (e) {
        console.error("Error clearing state on sign out:", e);
      }
    }
    setState(loadInitialState());
  };

  const refreshCloudSync = async () => {
    if (authUser) {
      await syncWithCloud(authUser, stateRef.current);
    }
  };

  // Profile & Goals
  const updateProfile = (profileUpdates: Partial<Profile>) => {
    const updated = { ...state.profile, ...profileUpdates, updated_at: new Date().toISOString() };
    saveState({ ...state, profile: updated });

    if (profileUpdates.theme_color) {
      applyTheme(profileUpdates.theme_color);
    }

    if (authUser) {
      syncQueue.enqueue("UPSERT_PROFILE", {
        ...state.profile,
        ...profileUpdates,
        id: authUser.id,
      });
    }
  };

  const updateGoal = (goalUpdates: Partial<FitnessGoal>) => {
    const current = state.goals[0] || DEFAULT_GOAL;
    const updated: FitnessGoal = { ...current, ...goalUpdates };
    saveState({ ...state, goals: [updated] });

    if (authUser) {
      const goalData = { ...updated };
      delete (goalData as Partial<FitnessGoal>).user_id;
      syncQueue.enqueue("UPSERT_GOAL", {
        ...goalData,
        user_id: authUser.id,
      });
    }
  };

  const completeOnboarding = async (data: {
    profile: Partial<Profile>;
    goal: Partial<FitnessGoal>;
    initialWeightKg: number;
  }) => {
    const today = formatDateToISO(new Date());
    const uid = authUserRef.current?.id || state.profile.id;

    const updatedProfile: Profile = {
      ...state.profile,
      ...data.profile,
      id: uid,
      latest_weight_kg: data.initialWeightKg,
      updated_at: new Date().toISOString(),
    };

    const currentGoal = state.goals[0] || DEFAULT_GOAL;
    const updatedGoal: FitnessGoal = {
      ...currentGoal,
      ...data.goal,
      user_id: uid,
      effective_from: today,
    };

    const initialWeightEntry: BodyWeightLog = {
      id: generateUUID(),
      user_id: uid,
      entry_date: today,
      weight_kg: data.initialWeightKg,
      notes: "Initial weight from onboarding",
      created_at: new Date().toISOString(),
    };

    saveState(
      {
        ...state,
        hasCompletedOnboarding: true,
        profile: updatedProfile,
        goals: [updatedGoal],
        weightLogs: [initialWeightEntry, ...state.weightLogs.filter((w) => w.entry_date !== today)],
      },
      uid
    );

    if (authUserRef.current) {
      try {
        await upsertProfile({
          id: authUserRef.current.id,
          ...data.profile,
          latest_weight_kg: data.initialWeightKg,
        });

        const onboardingGoalData = { ...updatedGoal };
        delete (onboardingGoalData as Partial<FitnessGoal>).user_id;
        await upsertFitnessGoal({
          ...onboardingGoalData,
          user_id: authUserRef.current.id,
        });

        await supabaseInsertWeightLog({
          id: initialWeightEntry.id,
          user_id: authUserRef.current.id,
          entry_date: today,
          weight_kg: data.initialWeightKg,
          notes: "Initial weight from onboarding",
        });

        const supabase = createClient();
        if (supabase) {
          await supabase.auth.updateUser({
            data: { has_completed_onboarding: true },
          });
        }
      } catch (e) {
        console.error("Error during completeOnboarding sync:", e);
      }
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
  const addWater = async (entryDate: string, amountMl: number) => {
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
      syncQueue.enqueue("INSERT_WATER_LOG", {
        id: newId,
        user_id: authUser.id,
        entry_date: entryDate,
        amount_ml: amountMl,
      });
    }
  };

  const deleteWaterLog = async (id: string) => {
    saveState({
      ...state,
      waterLogs: state.waterLogs.filter((w) => w.id !== id),
    });

    if (authUser) {
      syncQueue.enqueue("DELETE_WATER_LOG", { id });
    }
  };

  // Food Log Actions
  const addFoodLog = async (log: Omit<FoodLog, "id" | "user_id" | "created_at">) => {
    const newId = generateUUID();
    const newLog: FoodLog = {
      ...log,
      id: newId,
      user_id: authUser ? authUser.id : state.profile.id,
      created_at: new Date().toISOString(),
    };

    // Optimistic local state update
    saveState({ ...state, foodLogs: [newLog, ...state.foodLogs] });

    if (authUser) {
      syncQueue.enqueue("INSERT_FOOD_LOG", {
        id: newId,
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
      });
    }
  };

  const deleteFoodLog = async (id: string) => {
    // Optimistic local removal
    saveState({
      ...state,
      foodLogs: state.foodLogs.filter((f) => f.id !== id),
    });

    if (authUser) {
      syncQueue.enqueue("DELETE_FOOD_LOG", { id });
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
        syncQueue.enqueue("INSERT_FOOD_LOG", {
          id: dl.id,
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
        });
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
  const addWeightLog = async (entryDate: string, weightKg: number, notes?: string) => {
    const newId = generateUUID();
    const newLog: BodyWeightLog = {
      id: newId,
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
    const updatedWeightLogs = [newLog, ...state.weightLogs.filter((w) => w.entry_date !== entryDate)];
    saveState({
      ...state,
      profile: updatedProfile,
      weightLogs: updatedWeightLogs,
    });

    if (authUser) {
      syncQueue.enqueue("INSERT_WEIGHT_LOG", {
        id: newId,
        user_id: authUser.id,
        entry_date: entryDate,
        weight_kg: weightKg,
        notes,
      });

      syncQueue.enqueue("UPSERT_PROFILE", {
        id: authUser.id,
        latest_weight_kg: weightKg,
      });
    }
  };

  // Body Measurements
  const addMeasurementLog = async (entryDate: string, measurements: Partial<BodyMeasurementLog>) => {
    const newId = generateUUID();
    const newLog: BodyMeasurementLog = {
      id: newId,
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
      syncQueue.enqueue("INSERT_MEASUREMENT_LOG", {
        id: newId,
        user_id: authUser.id,
        entry_date: entryDate,
        ...measurements,
      });
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
        exercise_id: resolveExerciseUUID(re.exercise_id, state.exercises),
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
      syncQueue.enqueue("UPSERT_ROUTINE", newRoutine);
    }

    return newRoutine;
  };

  const deleteRoutine = (routineId: string) => {
    saveState({
      ...state,
      routines: state.routines.filter((r) => r.id !== routineId),
    });

    if (authUser) {
      syncQueue.enqueue("DELETE_ROUTINE", { id: routineId });
    }
  };

  const updateRoutine = (
    routineId: string,
    updates: Partial<Omit<WorkoutRoutine, "exercises">> & {
      exercises?: Array<{
        exercise_id: string;
        order_index?: number;
        target_sets?: number;
        target_reps?: string;
        target_weight_kg?: number | null;
        rest_seconds?: number;
        notes?: string | null;
      }>;
    }
  ) => {
    let updatedRoutineObj: WorkoutRoutine | null = null;
    const updatedRoutines = state.routines.map((routine) => {
      if (routine.id !== routineId) return routine;
      const exercises = updates.exercises
        ? updates.exercises.map((re, idx) => ({
            id: generateUUID(),
            routine_id: routineId,
            exercise_id: resolveExerciseUUID(re.exercise_id, state.exercises),
            order_index: re.order_index ?? idx,
            target_sets: re.target_sets ?? 3,
            target_reps: re.target_reps ?? "10",
            target_weight_kg: re.target_weight_kg ?? 20,
            rest_seconds: re.rest_seconds ?? 90,
            notes: re.notes ?? null,
            created_at: new Date().toISOString(),
          }))
        : routine.exercises;

      updatedRoutineObj = {
        ...routine,
        ...updates,
        exercises,
        updated_at: new Date().toISOString(),
      };
      return updatedRoutineObj;
    });

    saveState({ ...state, routines: updatedRoutines });

    if (authUser && updatedRoutineObj) {
      syncQueue.enqueue("UPSERT_ROUTINE", updatedRoutineObj);
    }

    return updatedRoutineObj;
  };

  const getLastExercisePerformance = (exerciseId: string) => {
    const resolvedExId = resolveExerciseUUID(exerciseId, state.exercises);
    const completedSessions = state.sessions
      .filter((s) => s.status === "completed" && s.sets && s.sets.some((set) => set.exercise_id === resolvedExId || set.exercise_id === exerciseId))
      .sort((a, b) => (b.completed_at || b.entry_date).localeCompare(a.completed_at || a.entry_date));

    if (completedSessions.length === 0) return null;
    const lastSession = completedSessions[0];
    const exSets = (lastSession.sets || []).filter(
      (s) => (s.exercise_id === resolvedExId || s.exercise_id === exerciseId) && s.is_completed
    );
    if (exSets.length === 0) return null;

    const maxWeight = Math.max(...exSets.map((s) => s.weight_kg), 0);
    const firstReps = exSets[0].reps || 10;
    return {
      date: lastSession.entry_date,
      setsCount: exSets.length,
      maxWeight,
      reps: firstReps,
      summary: `${maxWeight}kg × ${firstReps} reps (${exSets.length} sets)`,
    };
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
        const resolvedExId = resolveExerciseUUID(ce.exercise_id, state.exercises);
        if (ce.sets && ce.sets.length > 0) {
          ce.sets.forEach((s) => {
            const mappedType: WorkoutSetType = s.type === "drop" ? "dropset" : s.type;
            initialSets.push({
              id: generateUUID(),
              session_id: sessionId,
              exercise_id: resolvedExId,
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
              exercise_id: resolvedExId,
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
        const resolvedExId = resolveExerciseUUID(re.exercise_id, state.exercises);
        for (let s = 1; s <= re.target_sets; s++) {
          initialSets.push({
            id: generateUUID(),
            session_id: sessionId,
            exercise_id: resolvedExId,
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

    // Auto-sync customized exercises or renamed program back to the routine template
    let updatedRoutines = state.routines;
    if (routineId && (customExercises || customName)) {
      updatedRoutines = state.routines.map((r) => {
        if (r.id !== routineId) return r;
        const exercises = customExercises
          ? customExercises.map((ce, idx) => ({
              id: generateUUID(),
              routine_id: routineId,
              exercise_id: resolveExerciseUUID(ce.exercise_id, state.exercises),
              order_index: idx,
              target_sets: ce.target_sets || 3,
              target_reps: ce.target_reps || "10",
              target_weight_kg: ce.target_weight_kg ?? 20,
              rest_seconds: 90,
              notes: null,
              created_at: new Date().toISOString(),
            }))
          : r.exercises;

        return {
          ...r,
          name: customName || r.name,
          exercises,
          updated_at: new Date().toISOString(),
        };
      });
    }

    saveState({
      ...state,
      routines: updatedRoutines,
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
    const resolvedExId = resolveExerciseUUID(exerciseId, state.exercises);
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      const sets = session.sets || [];
      const exerciseSets = sets.filter((s) => s.exercise_id === resolvedExId);
      const nextSetNum = exerciseSets.length + 1;
      const lastSet = exerciseSets[exerciseSets.length - 1];

      const newSet: WorkoutSet = {
        id: generateUUID(),
        session_id: sessionId,
        exercise_id: resolvedExId,
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
    const resolvedExId = resolveExerciseUUID(exerciseId, state.exercises);
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      const sets = session.sets || [];
      const newSets: WorkoutSet[] = [];
      for (let s = 1; s <= initialSetsCount; s++) {
        newSets.push({
          id: generateUUID(),
          session_id: sessionId,
          exercise_id: resolvedExId,
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
    const resolvedExId = resolveExerciseUUID(exerciseId, state.exercises);
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId || !session.sets) return session;
      return {
        ...session,
        sets: session.sets.filter((s) => s.exercise_id !== resolvedExId && s.exercise_id !== exerciseId),
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

    let updatedRoutines = state.routines;
    if (completedSession) {
      const sess: WorkoutSession = completedSession;
      if (sess.routine_id) {
        const routine = state.routines.find((r) => r.id === sess.routine_id);
        if (routine && sess.sets && sess.sets.length > 0) {
          const distinctExIds: string[] = [];
          sess.sets.forEach((s) => {
            if (!distinctExIds.includes(s.exercise_id)) distinctExIds.push(s.exercise_id);
          });

          const syncedExercises = distinctExIds.map((exId, idx) => {
            const exSets = sess.sets!.filter((s) => s.exercise_id === exId);
            const completedSets = exSets.filter((s) => s.is_completed);
            const workingSets = completedSets.length > 0 ? completedSets : exSets;
            const maxWeight = Math.max(...workingSets.map((s) => s.weight_kg), 0);
            const avgReps = Math.round(workingSets.reduce((acc, s) => acc + s.reps, 0) / workingSets.length) || 10;
            const existingRoutineEx = routine.exercises?.find((re) => re.exercise_id === exId);

            return {
              id: existingRoutineEx?.id || generateUUID(),
              routine_id: routine.id,
              exercise_id: exId,
              order_index: idx,
              target_sets: exSets.length,
              target_reps: existingRoutineEx?.target_reps || `${avgReps}`,
              target_weight_kg: maxWeight > 0 ? maxWeight : (existingRoutineEx?.target_weight_kg ?? 20),
              rest_seconds: existingRoutineEx?.rest_seconds ?? 90,
              notes: existingRoutineEx?.notes || null,
              created_at: new Date().toISOString(),
            };
          });

          updatedRoutines = state.routines.map((r) =>
            r.id === routine.id
              ? { ...r, exercises: syncedExercises, updated_at: new Date().toISOString() }
              : r
          );
        }
      }
    }

    saveState({ ...state, sessions: updatedSessions, routines: updatedRoutines });

    if (authUser && completedSession) {
      const sess: WorkoutSession = completedSession;
      syncQueue.enqueue("SAVE_WORKOUT_SESSION", {
        session: {
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
        sets: (sess.sets || []).map((s) => ({
          session_id: sess.id,
          exercise_id: resolveExerciseUUID(s.exercise_id, state.exercises),
          set_number: s.set_number,
          set_type: s.set_type,
          weight_kg: s.weight_kg,
          reps: s.reps,
          is_completed: s.is_completed,
        })),
      });
    }
  };

  const discardWorkout = (sessionId: string) => {
    const updatedSessions = state.sessions.map((session) => {
      if (session.id !== sessionId) return session;
      return { ...session, status: "discarded" as const };
    });
    saveState({ ...state, sessions: updatedSessions });

    if (authUser) {
      syncQueue.enqueue("DELETE_WORKOUT_SESSION", { id: sessionId });
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
    syncQueueState,
    triggerSyncNow: () => syncQueue.processQueue(),
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
    updateRoutine,
    deleteRoutine,
    getLastExercisePerformance,
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
