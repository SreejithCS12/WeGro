"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Dumbbell,
  Play,
  Plus,
  Search,
  Layers,
  Trash2,
  Calendar,
  Timer,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  CalendarDays,
  Sparkles,
  X,
  Edit2,
  Check,
  RotateCcw,
} from "lucide-react";
import { WorkoutRoutine, WorkoutSession, Exercise, RoutineExercise } from "@/types/database";

export interface StagedExerciseItem {
  exercise_id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  target_sets: number;
  target_reps: string;
  target_weight_kg: number;
}

interface WorkoutViewProps {
  routines: WorkoutRoutine[];
  exercises: Exercise[];
  recentSessions: WorkoutSession[];
  weeklySchedule?: Record<number, string | null>;
  onUpdateWeeklySchedule?: (dayIndex: number, routineId: string | null) => void;
  onUpdateRoutine?: (
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
  ) => void;
  onAddRoutine?: (routine: {
    name: string;
    description?: string | null;
    exercises?: Array<{
      exercise_id: string;
      order_index: number;
      target_sets: number;
      target_reps: string;
      target_weight_kg: number;
      rest_seconds: number;
    }>;
  }) => void;
  getLastExercisePerformance?: (exerciseId: string) => {
    summary: string;
    maxWeight: number;
    reps: number;
    setsCount: number;
  } | null;
  onStartRoutine: (
    routineId?: string,
    customName?: string,
    customExercises?: Array<{
      exercise_id: string;
      target_sets: number;
      target_reps: string;
      target_weight_kg?: number | null;
    }>
  ) => void;
  onOpenCreateRoutine?: () => void;
  onDeleteRoutine?: (routineId: string) => void;
}

export function WorkoutView({
  routines,
  exercises,
  recentSessions,
  weeklySchedule,
  onUpdateWeeklySchedule,
  onUpdateRoutine,
  onAddRoutine,
  getLastExercisePerformance,
  onStartRoutine,
  onOpenCreateRoutine,
  onDeleteRoutine,
}: WorkoutViewProps) {
  // Current calendar day (1=Mon..6=Sat, 0=Sun)
  const todayDayIndex = new Date().getDay();
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayDayIndex);

  // Active weekly schedule mapping
  const activeWeeklySchedule = useMemo(() => {
    return (
      weeklySchedule || {
        1: "routine-chest-tricep",
        2: "routine-back-bicep",
        3: null,
        4: "routine-shoulders-arms",
        5: "routine-legs-calves",
        6: "routine-push",
        0: null,
      }
    );
  }, [weeklySchedule]);

  // Routine scheduled for selected day
  const currentScheduledRoutineId = activeWeeklySchedule[selectedDayIndex];
  const [todayRoutineId, setTodayRoutineId] = useState<string | null>(
    currentScheduledRoutineId !== undefined ? currentScheduledRoutineId : routines[0]?.id || null
  );
  const [isTodayRestDay, setIsTodayRestDay] = useState<boolean>(currentScheduledRoutineId === null);

  // Helper to extract staged exercises from a routine
  const getExercisesForRoutine = (routineId: string | null): StagedExerciseItem[] => {
    if (!routineId) return [];
    const found = routines.find((r) => r.id === routineId);
    if (!found || !found.exercises) return [];
    return found.exercises.map((re) => {
      const ex = exercises.find((e) => e.id === re.exercise_id);
      return {
        exercise_id: re.exercise_id,
        name: ex ? ex.name : "Exercise",
        muscle_group: ex ? ex.muscle_group : "Full Body",
        equipment: ex ? ex.equipment : "Gym",
        target_sets: re.target_sets || 3,
        target_reps: re.target_reps || "10",
        target_weight_kg: re.target_weight_kg ?? 20,
      };
    });
  };

  // Staged Exercises for pre-session customizing
  const [stagedExercises, setStagedExercises] = useState<StagedExerciseItem[]>(() => {
    return getExercisesForRoutine(todayRoutineId);
  });

  // Keep staged exercises in sync when todayRoutineId changes or routines update
  useEffect(() => {
    if (!isTodayRestDay && todayRoutineId) {
      setStagedExercises(getExercisesForRoutine(todayRoutineId));
    }
  }, [todayRoutineId, routines, isTodayRestDay]);

  // Program Renaming State (Addressing User Request 2)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");

  // Modals & Pickers
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isCreateSplitModalOpen, setIsCreateSplitModalOpen] = useState(false);
  const [newSplitName, setNewSplitName] = useState("");
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState("All");
  const [pickerSearch, setPickerSearch] = useState("");
  const [selectedSplitCategory, setSelectedSplitCategory] = useState<string>("All");

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const daysConfig = [
    { dayIndex: 1, name: "Monday", short: "MON" },
    { dayIndex: 2, name: "Tuesday", short: "TUE" },
    { dayIndex: 3, name: "Wednesday", short: "WED" },
    { dayIndex: 4, name: "Thursday", short: "THU" },
    { dayIndex: 5, name: "Friday", short: "FRI" },
    { dayIndex: 6, name: "Saturday", short: "SAT" },
    { dayIndex: 0, name: "Sunday", short: "SUN" },
  ];

  const getRoutineName = (id: string | null) => {
    if (!id) return "🛋️ Rest Day (Active Recovery)";
    return routines.find((r) => r.id === id)?.name || "Custom Split";
  };

  const activeRoutine = useMemo(() => {
    return routines.find((r) => r.id === todayRoutineId) || null;
  }, [routines, todayRoutineId]);

  // Switch selected split
  const handleSwitchSplit = (newRoutineId: string | null) => {
    setIsEditingTitle(false);
    if (newRoutineId === null) {
      setIsTodayRestDay(true);
      setTodayRoutineId(null);
      setStagedExercises([]);
      return;
    }
    setIsTodayRestDay(false);
    setTodayRoutineId(newRoutineId);
    setStagedExercises(getExercisesForRoutine(newRoutineId));
  };

  // Select day in weekly strip
  const handleSelectDay = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    const routineForDay = activeWeeklySchedule[dayIndex];
    handleSwitchSplit(routineForDay !== undefined ? routineForDay : null);
  };

  // Synchronize staged exercise updates back to the routine template
  const syncExercisesToRoutine = (updatedList: StagedExerciseItem[]) => {
    if (!todayRoutineId || !onUpdateRoutine) return;
    onUpdateRoutine(todayRoutineId, {
      exercises: updatedList.map((item, idx) => ({
        exercise_id: item.exercise_id,
        order_index: idx,
        target_sets: item.target_sets,
        target_reps: item.target_reps,
        target_weight_kg: item.target_weight_kg,
        rest_seconds: 90,
      })),
    });
  };

  // Save renamed program
  const handleSaveProgramName = () => {
    const trimmed = editedTitle.trim();
    if (!trimmed || !todayRoutineId) return;
    if (onUpdateRoutine) {
      onUpdateRoutine(todayRoutineId, { name: trimmed });
    }
    setIsEditingTitle(false);
    showToast(`Program renamed to "${trimmed}"!`);
  };

  // Reorder exercises
  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= stagedExercises.length) return;
    const copy = [...stagedExercises];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setStagedExercises(copy);
    syncExercisesToRoutine(copy);
  };

  // Update target sets
  const handleUpdateSets = (index: number, delta: number) => {
    const copy = [...stagedExercises];
    copy[index] = {
      ...copy[index],
      target_sets: Math.max(1, Math.min(8, copy[index].target_sets + delta)),
    };
    setStagedExercises(copy);
    syncExercisesToRoutine(copy);
  };

  // Update target weight
  const handleUpdateWeight = (index: number, delta: number) => {
    const copy = [...stagedExercises];
    copy[index] = {
      ...copy[index],
      target_weight_kg: Math.max(0, Number((copy[index].target_weight_kg + delta).toFixed(1))),
    };
    setStagedExercises(copy);
    syncExercisesToRoutine(copy);
  };

  // Update target reps
  const handleUpdateReps = (index: number, reps: string) => {
    const copy = [...stagedExercises];
    copy[index] = {
      ...copy[index],
      target_reps: reps,
    };
    setStagedExercises(copy);
    syncExercisesToRoutine(copy);
  };

  // Remove exercise
  const handleRemoveExercise = (index: number) => {
    const removedName = stagedExercises[index]?.name;
    const updated = stagedExercises.filter((_, i) => i !== index);
    setStagedExercises(updated);
    syncExercisesToRoutine(updated);
    showToast(`Removed "${removedName}" from plan`);
  };

  // Add exercise from picker
  const handleAddExerciseFromPicker = (exId: string) => {
    const ex = exercises.find((e) => e.id === exId);
    if (!ex) return;
    const newItem: StagedExerciseItem = {
      exercise_id: ex.id,
      name: ex.name,
      muscle_group: ex.muscle_group,
      equipment: ex.equipment,
      target_sets: 3,
      target_reps: "10-12",
      target_weight_kg: 20,
    };
    const updated = [...stagedExercises, newItem];
    setStagedExercises(updated);
    syncExercisesToRoutine(updated);
    setIsAddExerciseModalOpen(false);
    showToast(`Added "${ex.name}" to routine!`);
  };

  // Create new split
  const handleCreateNewSplit = () => {
    const trimmed = newSplitName.trim();
    if (!trimmed) {
      alert("Please enter a name for the new split program.");
      return;
    }
    if (onAddRoutine) {
      onAddRoutine({
        name: trimmed,
        description: "Custom weekly split routine",
        exercises: [
          {
            exercise_id: exercises[0]?.id || "ex-c1",
            order_index: 0,
            target_sets: 3,
            target_reps: "8-10",
            target_weight_kg: 60,
            rest_seconds: 90,
          },
        ],
      });
      setIsCreateSplitModalOpen(false);
      setNewSplitName("");
      showToast(`Created "${trimmed}" split program!`);
    } else if (onOpenCreateRoutine) {
      setIsCreateSplitModalOpen(false);
      onOpenCreateRoutine();
    }
  };

  // Start the customized session
  const handleStartTodaySession = () => {
    if (stagedExercises.length === 0) {
      alert("Please add at least 1 exercise before starting today's session.");
      return;
    }
    const routineName = todayRoutineId
      ? routines.find((r) => r.id === todayRoutineId)?.name || "Workout Session"
      : "Custom Workout Session";

    onStartRoutine(todayRoutineId || undefined, routineName, stagedExercises);
  };

  // Filtered exercises for picker modal
  const filteredPickerExercises = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesMuscle =
        pickerMuscleFilter === "All" ||
        ex.muscle_group.toLowerCase().includes(pickerMuscleFilter.toLowerCase());
      const matchesSearch =
        !pickerSearch ||
        ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(pickerSearch.toLowerCase());
      return matchesMuscle && matchesSearch;
    });
  }, [exercises, pickerMuscleFilter, pickerSearch]);

  // Filter routines in bottom library
  const filteredRoutines = routines.filter((r) => {
    if (selectedSplitCategory === "All") return true;
    if (selectedSplitCategory === "Classic Splits") {
      return (
        r.name.includes("Chest & Triceps") ||
        r.name.includes("Back & Biceps") ||
        r.name.includes("Shoulders & Abs") ||
        r.name.includes("Legs & Calves")
      );
    }
    if (selectedSplitCategory === "PPL") {
      return r.name.includes("Push") || r.name.includes("Pull") || r.name.includes("Leg");
    }
    if (selectedSplitCategory === "Custom") {
      return !r.id.startsWith("routine-");
    }
    return true;
  });

  const completedSessions = recentSessions.filter((s) => s.status === "completed");

  const formatDuration = (seconds?: number | null) => {
    if (!seconds) return "—";
    const mins = Math.floor(seconds / 60);
    return `${mins} min`;
  };

  const getExerciseName = (exId: string) => {
    return exercises.find((e) => e.id === exId)?.name || "Exercise";
  };

  const activeDayObj = daysConfig.find((d) => d.dayIndex === selectedDayIndex) || daysConfig[0];

  return (
    <div className="space-y-5 sm:space-y-6 pb-24 animate-fade-in">
      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-emerald-600 text-white px-4 py-2 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-bounce-subtle">
          <Check className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. 7-DAY WEEKLY TRAINING SPLIT SCHEDULE (MON - SUN)                        */}
      {/* ========================================================================= */}
      <div className="bg-[#141417] border border-[#27272a] rounded-3xl p-3.5 sm:p-5 shadow-lg space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-violet-400 shrink-0" />
              <h3 className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-white">
                7-Day Weekly Training Split (Mon – Sun)
              </h3>
            </div>
            <p className="text-[11px] sm:text-xs text-zinc-400">
              Tap any day card to view, rename, or customize the exercises inside that workout.
            </p>
          </div>

          <button
            onClick={() => setIsWeeklyModalOpen(true)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/40 text-violet-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-sm shrink-0"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Customize Weekly Plan</span>
          </button>
        </div>

        {/* Responsive 7-Day Strip:
            - Mobile (< 768px): Horizontal swipe strip with snap-points
            - Tablet (768px - 1024px): 4-col / 7-col grid
            - Desktop (>= 1024px): 7 equal columns
        */}
        <div className="flex overflow-x-auto gap-2 pb-1 snap-x scrollbar-thin scrollbar-thumb-zinc-800 -mx-1 px-1 md:grid md:grid-cols-4 lg:grid-cols-7 md:overflow-visible">
          {daysConfig.map((day) => {
            const isToday = day.dayIndex === todayDayIndex;
            const isSelected = day.dayIndex === selectedDayIndex;
            const routineId = activeWeeklySchedule[day.dayIndex];
            const hasWorkout = Boolean(routineId);
            const routineObj = routines.find((r) => r.id === routineId);

            return (
              <div
                key={day.short}
                onClick={() => handleSelectDay(day.dayIndex)}
                className={`w-[125px] sm:w-[135px] md:w-auto shrink-0 snap-start p-2.5 sm:p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 select-none active:scale-98 ${
                  isSelected
                    ? "bg-violet-950/40 border-violet-500 shadow-lg shadow-violet-600/20 ring-1 ring-violet-500"
                    : "bg-[#18181b] border-[#27272a] hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-white">{day.short}</span>
                  {isToday ? (
                    <span className="px-1.5 py-0.5 rounded bg-violet-600 text-white font-black text-[9px] uppercase tracking-wide">
                      Today
                    </span>
                  ) : isSelected ? (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-300 font-bold text-[9px] uppercase">
                      Viewing
                    </span>
                  ) : null}
                </div>

                <div>
                  <div className="text-[11px] sm:text-xs font-bold text-zinc-200 leading-tight line-clamp-2">
                    {routineId ? getRoutineName(routineId) : "🛋️ Rest Day"}
                  </div>
                  <span className="text-[9px] sm:text-[10px] text-zinc-500 block mt-0.5">
                    {hasWorkout ? `${routineObj?.exercises?.length || 0} exercises` : "Active Recovery"}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-zinc-800 text-[10px] text-violet-400 font-semibold flex items-center justify-between">
                  <span>{isSelected ? "Editing" : "Tap to Edit"}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. PROGRAM & EXERCISE CUSTOMIZER (EDIT WORKOUTS INSIDE / RENAME)           */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-b from-[#181820] to-[#131316] border-2 border-violet-500/50 rounded-3xl p-3.5 sm:p-5 shadow-2xl space-y-4">
        {/* Header: Day Focus & Workout/Rest Mode Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                Selected Day Split:
              </span>
              <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-xs">
                {selectedDayIndex === todayDayIndex ? `Today (${activeDayObj.name})` : activeDayObj.name}
              </span>
            </div>
          </div>

          {/* Mode Switcher: Workout Day vs Rest Day */}
          <div className="flex items-center self-start sm:self-auto bg-[#101014] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => {
                if (isTodayRestDay) {
                  handleSwitchSplit(routines[0]?.id || "routine-chest-tricep");
                  if (onUpdateWeeklySchedule) onUpdateWeeklySchedule(selectedDayIndex, routines[0]?.id || "routine-chest-tricep");
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                !isTodayRestDay ? "bg-violet-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>💪 Workout Day</span>
            </button>
            <button
              onClick={() => {
                handleSwitchSplit(null);
                if (onUpdateWeeklySchedule) onUpdateWeeklySchedule(selectedDayIndex, null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                isTodayRestDay ? "bg-emerald-600 text-white shadow-sm" : "text-zinc-400 hover:text-white"
              }`}
            >
              <span>🛋️ Rest Day</span>
            </button>
          </div>
        </div>

        {/* PROGRAM TITLE & INLINE RENAMING (ADDRESSING USER QUESTION 2) */}
        {!isTodayRestDay && (
          <div className="flex items-center justify-between gap-2 pt-0.5">
            {!isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <h2 className="text-base sm:text-lg font-black text-white truncate">
                  {activeRoutine?.name || "Workout Routine"}
                </h2>
                <button
                  onClick={() => {
                    setEditedTitle(activeRoutine?.name || "");
                    setIsEditingTitle(true);
                  }}
                  className="px-2 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-violet-300 text-xs font-bold border border-zinc-700 flex items-center gap-1 transition active:scale-95 shrink-0"
                  title="Rename this workout program"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Rename</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1 animate-fade-in">
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveProgramName();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                  placeholder="Enter program name..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-zinc-900 border border-violet-500 text-white text-xs sm:text-sm font-bold focus:outline-none"
                />
                <button
                  onClick={handleSaveProgramName}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition active:scale-95"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditingTitle(false)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-bold"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        )}

        {/* REST DAY DISPLAY */}
        {isTodayRestDay ? (
          <div className="p-6 sm:p-8 text-center space-y-3 bg-[#111114] rounded-2xl border border-zinc-800">
            <div className="text-4xl">🛋️</div>
            <h3 className="text-sm sm:text-base font-bold text-emerald-400">
              Marked as Rest Day (Active Recovery)
            </h3>
            <p className="text-xs text-zinc-400 max-w-md mx-auto">
              Muscles rebuild, recover, and grow stronger during rest. Focus on hydration, stretching, and 8+ hours of sleep!
            </p>
            <button
              onClick={() => {
                handleSwitchSplit(routines[0]?.id || "routine-chest-tricep");
                if (onUpdateWeeklySchedule) onUpdateWeeklySchedule(selectedDayIndex, routines[0]?.id || "routine-chest-tricep");
              }}
              className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 transition shadow-lg shadow-violet-600/30"
            >
              Switch to Workout Split
            </button>
          </div>
        ) : (
          <>
            {/* SPLIT SELECTOR ROW */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-[#121216] p-3 rounded-2xl border border-zinc-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Assigned Split Routine
                </span>
                <p className="text-xs text-zinc-300">Choose a different routine or keep current</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={todayRoutineId || ""}
                  onChange={(e) => {
                    handleSwitchSplit(e.target.value);
                    if (onUpdateWeeklySchedule) onUpdateWeeklySchedule(selectedDayIndex, e.target.value);
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-zinc-900 border border-violet-500/50 text-xs font-bold text-violet-300 focus:outline-none cursor-pointer"
                >
                  {routines.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setIsCreateSplitModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold border border-zinc-700 shrink-0 active:scale-95"
                  title="Create a new split program"
                >
                  + New Split
                </button>
              </div>
            </div>

            {/* EXERCISES INSIDE PROGRAM (ADDRESSING USER QUESTION 1) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between pt-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-white">
                      Exercises Inside Plan ({stagedExercises.length})
                    </span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                      Editable
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    Add movements, delete exercises, or tweak sets/weights. Your changes update this plan for all future cycles!
                  </p>
                </div>

                <button
                  onClick={() => setIsAddExerciseModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-violet-600/30 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Exercise</span>
                </button>
              </div>

              {/* STAGED EXERCISE CARDS LIST */}
              <div className="space-y-2.5">
                {stagedExercises.length === 0 ? (
                  <div className="p-6 text-center text-xs text-zinc-500 bg-[#141417] rounded-2xl border border-dashed border-zinc-800">
                    No exercises in this routine yet. Tap <strong>"+ Add Exercise"</strong> to build your workout!
                  </div>
                ) : (
                  stagedExercises.map((ex, idx) => {
                    const prevStats = getLastExercisePerformance
                      ? getLastExercisePerformance(ex.exercise_id)
                      : null;

                    return (
                      <div
                        key={ex.exercise_id + "-" + idx}
                        className="p-3 sm:p-3.5 rounded-2xl bg-[#141418] border border-zinc-800/90 hover:border-violet-500/40 transition space-y-2.5 shadow-sm"
                      >
                        {/* Header: Title, Muscle, Previous Performance & Controls */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                  {ex.name}
                                </h4>
                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-semibold shrink-0">
                                  {ex.muscle_group}
                                </span>
                              </div>
                              {/* 'Last Time' History badge (Addressing User Requirement 4) */}
                              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium mt-0.5">
                                <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>
                                  {prevStats
                                    ? `Last time: ${prevStats.summary}`
                                    : "First cycle in this routine"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Reorder & Delete controls */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => handleMoveExercise(idx, "up")}
                              disabled={idx === 0}
                              className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-95"
                              title="Move up"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => handleMoveExercise(idx, "down")}
                              disabled={idx === stagedExercises.length - 1}
                              className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-95"
                              title="Move down"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => handleRemoveExercise(idx)}
                              className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 flex items-center justify-center transition active:scale-95 ml-1"
                              title="Remove exercise from plan"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Responsive Steppers: Sets, Weight, Reps
                            - Mobile & Tablet: 2-column or 3-column touch grid
                            - Desktop: Clean inline grid with large tap targets
                        */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 border-t border-zinc-800/80">
                          {/* Sets Stepper */}
                          <div className="bg-[#101013] p-2 rounded-xl border border-zinc-800 flex items-center justify-between sm:flex-col sm:justify-center">
                            <span className="text-[10px] uppercase font-bold text-zinc-400">
                              Target Sets
                            </span>
                            <div className="flex items-center gap-2 sm:mt-1">
                              <button
                                onClick={() => handleUpdateSets(idx, -1)}
                                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center active:scale-95"
                              >
                                -
                              </button>
                              <span className="text-xs font-black text-white font-mono min-w-[20px] text-center">
                                {ex.target_sets}
                              </span>
                              <button
                                onClick={() => handleUpdateSets(idx, 1)}
                                className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center active:scale-95"
                              >
                                +
                              </button>
                            </div>
                          </div>

                          {/* Weight Stepper */}
                          <div className="bg-[#101013] p-2 rounded-xl border border-zinc-800 flex items-center justify-between sm:flex-col sm:justify-center">
                            <span className="text-[10px] uppercase font-bold text-zinc-400">
                              Weight (kg)
                            </span>
                            <div className="flex items-center gap-1 sm:mt-1">
                              <button
                                onClick={() => handleUpdateWeight(idx, -2.5)}
                                className="px-2 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] active:scale-95"
                              >
                                -2.5
                              </button>
                              <span className="text-xs font-black text-violet-300 font-mono min-w-[34px] text-center">
                                {ex.target_weight_kg}kg
                              </span>
                              <button
                                onClick={() => handleUpdateWeight(idx, 2.5)}
                                className="px-2 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] active:scale-95"
                              >
                                +2.5
                              </button>
                            </div>
                          </div>

                          {/* Reps Selector */}
                          <div className="bg-[#101013] p-2 rounded-xl border border-zinc-800 flex items-center justify-between sm:flex-col sm:justify-center">
                            <span className="text-[10px] uppercase font-bold text-zinc-400">
                              Target Reps
                            </span>
                            <div className="grid grid-cols-4 gap-1 w-auto sm:w-full sm:mt-1">
                              {["6-8", "8-10", "10-12", "12-15"].map((repsOption) => (
                                <button
                                  key={repsOption}
                                  onClick={() => handleUpdateReps(idx, repsOption)}
                                  className={`py-1 px-1.5 rounded-lg text-[10px] font-bold text-center transition active:scale-95 ${
                                    ex.target_reps === repsOption
                                      ? "bg-violet-600 text-white shadow-sm"
                                      : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                                  }`}
                                >
                                  {repsOption}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* SAVE / AUTO-SYNC BANNER */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-violet-950/20 border border-violet-500/30 text-xs text-zinc-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Changes automatically update your <strong className="text-violet-300">{activeRoutine?.name || "Program"}</strong> plan for upcoming cycles.
                  </span>
                </div>
              </div>

              {/* Primary Start Workout Button */}
              <button
                onClick={handleStartTodaySession}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition active:scale-98"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Start Workout with These Exercises ▶</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ROUTINE SPLITS LIBRARY (ALL SPLITS)                                    */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Routine Splits Library ({routines.length})
            </h3>
            <p className="text-[11px] text-zinc-500">Select any split to load into your schedule</p>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {["All", "Classic Splits", "PPL", "Custom"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedSplitCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition ${
                  selectedSplitCategory === cat
                    ? "bg-violet-600 text-white shadow-sm"
                    : "bg-[#141417] text-zinc-400 hover:text-white border border-[#27272a]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Routines Grid (Desktop: 3 cols, Tablet: 2 cols, Mobile: 1 col) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredRoutines.map((routine) => {
            const isCustom = !routine.id.startsWith("routine-");
            const exerciseCount = routine.exercises?.length || 0;

            return (
              <div
                key={routine.id}
                className="bg-[#141417] border border-[#27272a] hover:border-violet-500/50 rounded-2xl p-4 shadow-md transition-all flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 min-w-0 pr-2">
                      <h4 className="text-sm font-bold text-white truncate">{routine.name}</h4>
                      {isCustom && (
                        <span className="text-[9px] font-bold text-violet-300 bg-violet-500/20 px-1.5 py-0.5 rounded shrink-0">
                          Custom
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20">
                        {exerciseCount} Exercises
                      </span>
                      {isCustom && onDeleteRoutine && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete routine "${routine.name}"?`)) {
                              onDeleteRoutine(routine.id);
                            }
                          }}
                          className="p-1 text-zinc-600 hover:text-rose-400 transition"
                          title="Delete routine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mb-2.5">
                    {routine.description || "Custom planned resistance routine."}
                  </p>

                  {/* Exercise Preview Chips */}
                  {routine.exercises && routine.exercises.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {routine.exercises.slice(0, 3).map((re) => (
                        <span
                          key={re.id}
                          className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/80 text-zinc-300 truncate max-w-[140px]"
                        >
                          {getExerciseName(re.exercise_id)}
                        </span>
                      ))}
                      {routine.exercises.length > 3 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800/60 text-zinc-500">
                          +{routine.exercises.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => {
                    handleSwitchSplit(routine.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#18181b] group-hover:bg-violet-600 group-hover:text-white border border-[#27272a] group-hover:border-violet-500 text-xs font-bold text-zinc-300 transition-all flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Use for This Day's Workout</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT COMPLETED WORKOUT SESSIONS                                      */}
      {/* ========================================================================= */}
      {completedSessions.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Recent Gym History ({completedSessions.length})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedSessions.slice(0, 6).map((session) => {
              const setsCount = session.sets?.filter((s) => s.is_completed).length || 0;
              const volume =
                session.sets
                  ?.filter((s) => s.is_completed)
                  .reduce((acc, s) => acc + s.weight_kg * s.reps, 0) || 0;

              return (
                <div
                  key={session.id}
                  className="bg-[#141417] border border-[#27272a] rounded-2xl p-3.5 shadow-sm space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate max-w-[180px]">
                      {session.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {session.entry_date}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 bg-[#18181b] p-2 rounded-xl text-center border border-zinc-800 text-[11px]">
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">Duration</span>
                      <span className="font-bold text-zinc-300 font-mono">
                        {formatDuration(session.duration_seconds)}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">Sets</span>
                      <span className="font-bold text-emerald-400 font-mono">{setsCount}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-zinc-500 uppercase block">Volume</span>
                      <span className="font-bold text-violet-400 font-mono">
                        {volume.toLocaleString()} kg
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CUSTOMIZE 7-DAY WEEKLY SCHEDULE (MON - SUN)                      */}
      {/* ========================================================================= */}
      {isWeeklyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[90vh]">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Customize 7-Day Weekly Training Split</h3>
                <p className="text-[11px] text-zinc-400">
                  Assign what workout program you do Monday through Sunday
                </p>
              </div>
              <button
                onClick={() => setIsWeeklyModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 max-h-[60vh]">
              {daysConfig.map((day) => {
                const currentRoutineId = activeWeeklySchedule[day.dayIndex];

                return (
                  <div
                    key={day.dayIndex}
                    className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-1.5 w-24">
                      <span className="text-xs font-black text-white">{day.name}</span>
                      {day.dayIndex === todayDayIndex && (
                        <span className="px-1 py-0.2 rounded bg-violet-600 text-[8px] font-bold text-white uppercase">
                          Today
                        </span>
                      )}
                    </div>

                    <select
                      value={currentRoutineId || "rest"}
                      onChange={(e) => {
                        const val = e.target.value === "rest" ? null : e.target.value;
                        if (onUpdateWeeklySchedule) {
                          onUpdateWeeklySchedule(day.dayIndex, val);
                        }
                        if (day.dayIndex === selectedDayIndex) {
                          handleSwitchSplit(val);
                        }
                      }}
                      className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-bold text-violet-300 focus:outline-none"
                    >
                      {routines.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.name}
                        </option>
                      ))}
                      <option value="rest">🛋️ Rest Day (Active Recovery)</option>
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="p-3 border-t border-[#27272a] bg-[#101013] flex items-center justify-between">
              <button
                onClick={() => {
                  setIsWeeklyModalOpen(false);
                  setIsCreateSplitModalOpen(true);
                }}
                className="text-xs text-violet-400 font-bold hover:underline"
              >
                + Create New Custom Split
              </button>
              <button
                onClick={() => setIsWeeklyModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold hover:bg-violet-500 shadow-lg shadow-violet-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ADD EXERCISE TO TODAY'S PLAN                                    */}
      {/* ========================================================================= */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[85vh]">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Add Exercise to Plan</h3>
                <p className="text-[11px] text-zinc-400">
                  Tap any exercise to immediately add it to this workout program
                </p>
              </div>
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search & Muscle Filters */}
            <div className="p-3 border-b border-zinc-800 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search exercise by name or muscle..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 no-scrollbar">
                {["All", "Chest", "Back", "Arms", "Shoulders", "Legs", "Core"].map((m) => (
                  <button
                    key={m}
                    onClick={() => setPickerMuscleFilter(m)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold shrink-0 transition active:scale-95 ${
                      pickerMuscleFilter === m
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Filtered Exercise List */}
            <div className="p-3 overflow-y-auto space-y-1.5 max-h-80">
              {filteredPickerExercises.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">
                  No exercises found matching "{pickerSearch}".
                </div>
              ) : (
                filteredPickerExercises.map((ex) => (
                  <div
                    key={ex.id}
                    onClick={() => handleAddExerciseFromPicker(ex.id)}
                    className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-violet-500/50 hover:bg-zinc-800/60 flex items-center justify-between cursor-pointer transition active:scale-98"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                      <p className="text-[10px] text-zinc-400">
                        {ex.muscle_group} · {ex.equipment}
                      </p>
                    </div>
                    <span className="text-[11px] font-bold text-violet-400 bg-violet-500/10 hover:bg-violet-600 hover:text-white px-2.5 py-1 rounded-lg border border-violet-500/30 transition">
                      + Add to Plan
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CREATE NEW SPLIT PROGRAM                                         */}
      {/* ========================================================================= */}
      {isCreateSplitModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-md flex flex-col shadow-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Create New Split Program</h3>
              <button
                onClick={() => setIsCreateSplitModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                  Program Name
                </label>
                <input
                  type="text"
                  value={newSplitName}
                  onChange={(e) => setNewSplitName(e.target.value)}
                  placeholder="e.g. Upper Body Blast, Arm Blaster, Leg Day Hypertrophy"
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsCreateSplitModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-zinc-800 text-zinc-300 text-xs font-bold hover:bg-zinc-700"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewSplit}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30"
              >
                Create Program
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
