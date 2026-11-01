"use client";

import { useState, useMemo } from "react";
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
    currentScheduledRoutineId !== undefined ? currentScheduledRoutineId : "routine-chest-tricep"
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
        target_weight_kg: re.target_weight_kg || 20,
      };
    });
  };

  // Staged Exercises for pre-session customizing
  const [stagedExercises, setStagedExercises] = useState<StagedExerciseItem[]>(() => {
    return getExercisesForRoutine(todayRoutineId);
  });

  // Modals & Pickers
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState("All");
  const [pickerSearch, setPickerSearch] = useState("");

  // Filters for split routines library
  const [selectedSplitCategory, setSelectedSplitCategory] = useState<string>("All");

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

  // Switch selected split
  const handleSwitchSplit = (newRoutineId: string | null) => {
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

  // Reorder exercises
  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= stagedExercises.length) return;
    setStagedExercises((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  // Update target sets
  const handleUpdateSets = (index: number, delta: number) => {
    setStagedExercises((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        target_sets: Math.max(1, Math.min(8, copy[index].target_sets + delta)),
      };
      return copy;
    });
  };

  // Update target weight
  const handleUpdateWeight = (index: number, delta: number) => {
    setStagedExercises((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        target_weight_kg: Math.max(0, Number((copy[index].target_weight_kg + delta).toFixed(1))),
      };
      return copy;
    });
  };

  // Update target reps
  const handleUpdateReps = (index: number, reps: string) => {
    setStagedExercises((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        target_reps: reps,
      };
      return copy;
    });
  };

  // Remove exercise
  const handleRemoveExercise = (index: number) => {
    setStagedExercises((prev) => prev.filter((_, i) => i !== index));
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
    setStagedExercises((prev) => [...prev, newItem]);
    setIsAddExerciseModalOpen(false);
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
    <div className="space-y-6 pb-20 animate-fade-in">
      {/* ========================================================================= */}
      {/* 1. TODAY'S PRE-SESSION SETUP & CUSTOMIZATION CARD (CORE LIFTER FLOW) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-b from-[#18181f] to-[#141417] border-2 border-violet-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
        <div className="flex flex-col gap-2 border-b border-zinc-800 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                Step 1: Set Today's Workout First
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px]">
              {selectedDayIndex === todayDayIndex ? `Today (${activeDayObj.short})` : activeDayObj.name}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm sm:text-base font-black text-white leading-tight">
              {selectedDayIndex === todayDayIndex ? "Today's Split:" : `${activeDayObj.name} Split:`}
            </h2>

            {/* Split Switcher Dropdown */}
            <select
              value={isTodayRestDay ? "rest" : todayRoutineId || "rest"}
              onChange={(e) => {
                if (e.target.value === "rest") {
                  handleSwitchSplit(null);
                } else {
                  handleSwitchSplit(e.target.value);
                }
              }}
              className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-zinc-900 border border-violet-500/50 text-xs font-bold text-violet-300 focus:outline-none cursor-pointer"
            >
              {routines.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
              <option value="rest">🛋️ Mark as Rest Day</option>
            </select>
          </div>
        </div>

        {isTodayRestDay ? (
          <div className="p-6 text-center space-y-2 bg-[#121215] rounded-2xl border border-zinc-800">
            <div className="text-3xl">🛋️</div>
            <h3 className="text-sm font-bold text-emerald-400">Marked as Rest Day (Active Recovery)</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Muscles repair and grow stronger during recovery. Stretch, hydrate, and rest!
            </p>
            <button
              onClick={() => handleSwitchSplit(routines[0]?.id || "routine-chest-tricep")}
              className="px-4 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold mt-2 hover:bg-violet-500 transition"
            >
              Switch to Workout Split
            </button>
          </div>
        ) : (
          <>
            {/* Planned Exercises with Steppers */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Planned Exercises ({stagedExercises.length})
                </span>
                <span className="text-[11px] text-zinc-400">
                  Tap <span className="text-violet-400 font-bold">- / +</span> to customize targets
                </span>
              </div>

              <div className="space-y-2.5">
                {stagedExercises.map((ex, idx) => (
                  <div
                    key={ex.exercise_id + "-" + idx}
                    className="p-3 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-violet-500/40 transition-all space-y-2.5 shadow-sm"
                  >
                    {/* Exercise Header Row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-400 font-extrabold text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                            {ex.name}
                          </h4>
                          <p className="text-[10px] text-zinc-400">
                            {ex.muscle_group} · {ex.equipment}
                          </p>
                        </div>
                      </div>

                      {/* Reorder & Delete controls */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleMoveExercise(idx, "up")}
                          disabled={idx === 0}
                          className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-95"
                          title="Move exercise up"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => handleMoveExercise(idx, "down")}
                          disabled={idx === stagedExercises.length - 1}
                          className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-zinc-800 disabled:opacity-20 text-zinc-300 flex items-center justify-center text-xs font-bold transition active:scale-95"
                          title="Move exercise down"
                        >
                          ↓
                        </button>
                        <button
                          onClick={() => handleRemoveExercise(idx)}
                          className="w-6 h-6 rounded-lg bg-zinc-900 hover:bg-rose-950/60 hover:text-rose-400 text-zinc-400 flex items-center justify-center transition active:scale-95 ml-1"
                          title="Remove from today's plan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Interactive Inline Steppers (Sets, Weight, Reps) */}
                    <div className="space-y-2 pt-1 border-t border-zinc-800/80">
                      {/* Row 1: Sets and Weight (50/50 Grid with labels on top) */}
                      <div className="grid grid-cols-2 gap-2">
                        {/* Target Sets Stepper */}
                        <div className="bg-[#121215] p-2 rounded-xl border border-[#27272a] flex flex-col items-center justify-center gap-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Target Sets</span>
                          <div className="flex items-center justify-center gap-2 w-full">
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

                        {/* Target Weight Stepper */}
                        <div className="bg-[#121215] p-2 rounded-xl border border-[#27272a] flex flex-col items-center justify-center gap-1">
                          <span className="text-[10px] uppercase font-bold text-zinc-400">Weight (kg)</span>
                          <div className="flex items-center justify-center gap-1 w-full">
                            <button
                              onClick={() => handleUpdateWeight(idx, -2.5)}
                              className="px-2 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] active:scale-95 whitespace-nowrap min-w-[30px] text-center"
                            >
                              -2.5
                            </button>
                            <span className="text-xs font-black text-violet-300 font-mono min-w-[34px] text-center">
                              {ex.target_weight_kg}kg
                            </span>
                            <button
                              onClick={() => handleUpdateWeight(idx, 2.5)}
                              className="px-2 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] active:scale-95 whitespace-nowrap min-w-[30px] text-center"
                            >
                              +2.5
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Row 2: Target Reps Quick Selector */}
                      <div className="bg-[#121215] p-2 rounded-xl border border-[#27272a] flex flex-col sm:flex-row items-center justify-between gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-zinc-400">Target Reps</span>
                        <div className="grid grid-cols-4 gap-1 w-full sm:w-auto">
                          {["6-8", "8-10", "10-12", "12-15"].map((repsOption) => (
                            <button
                              key={repsOption}
                              onClick={() => handleUpdateReps(idx, repsOption)}
                              className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition active:scale-95 ${
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
                ))}
              </div>

              <button
                onClick={() => setIsAddExerciseModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800 border border-dashed border-[#27272a] hover:border-violet-500/50 text-xs font-bold text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5 active:scale-98"
              >
                <Plus className="w-3.5 h-3.5 text-violet-400" />
                <span>+ Add Another Exercise to Today's Plan</span>
              </button>
            </div>

            {/* Primary Start Workout Button */}
            <button
              onClick={handleStartTodaySession}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Today's Workout Session ▶</span>
            </button>
          </>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2. 7-DAY WEEKLY TRAINING SPLIT PLAN (MON-SUN) */}
      {/* ========================================================================= */}
      <div className="bg-[#141417] border border-[#27272a] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <CalendarDays className="w-4 h-4 text-violet-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                7-Day Weekly Training Split Plan
              </h3>
            </div>
            <p className="text-[11px] text-zinc-400">
              Your weekly split schedule (swipe or tap any day to preview & customize)
            </p>
          </div>

          {onOpenCreateRoutine && (
            <button
              onClick={onOpenCreateRoutine}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-violet-300 transition flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Split</span>
            </button>
          )}
        </div>

        {/* Swipeable Horizontal Strip on Mobile, 7 cols on Desktop */}
        <div className="flex overflow-x-auto gap-2.5 pb-2 snap-x scrollbar-thin scrollbar-thumb-zinc-800 -mx-1 px-1 lg:grid lg:grid-cols-7 lg:overflow-visible">
          {daysConfig.map((day) => {
            const isToday = day.dayIndex === todayDayIndex;
            const isSelected = day.dayIndex === selectedDayIndex;
            const routineId = activeWeeklySchedule[day.dayIndex];
            const hasWorkout = Boolean(routineId);

            return (
              <div
                key={day.short}
                onClick={() => handleSelectDay(day.dayIndex)}
                className={`w-[130px] lg:w-auto shrink-0 snap-start p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 active:scale-98 ${
                  isSelected
                    ? "bg-violet-950/40 border-violet-500 shadow-md shadow-violet-600/30 ring-1 ring-violet-500"
                    : "bg-[#18181b] border-[#27272a] hover:border-zinc-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">{day.short}</span>
                  {isToday ? (
                    <span className="px-1.5 py-0.5 rounded bg-violet-600 text-white font-bold text-[9px] uppercase">
                      Today
                    </span>
                  ) : isSelected ? (
                    <span className="px-1.5 py-0.5 rounded bg-zinc-700 text-zinc-200 font-bold text-[9px] uppercase">
                      Viewing
                    </span>
                  ) : null}
                </div>

                <div>
                  <div className="text-xs font-bold text-zinc-200 leading-snug line-clamp-2">
                    {routineId ? getRoutineName(routineId) : "🛋️ Rest Day"}
                  </div>
                  <span className="text-[10px] text-zinc-500 block mt-1">
                    {hasWorkout ? "Target Split" : "Recovery"}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-zinc-800 text-[10px] text-violet-400 font-semibold flex items-center justify-between">
                  <span>{isSelected ? "Selected" : "Tap Day"}</span>
                  <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. ROUTINE SPLITS LIBRARY */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Routine Splits Library ({routines.length})
            </h3>
            <p className="text-[11px] text-zinc-500">
              Select any split to load into today's workout
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
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

        {/* Routines Grid */}
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
                  <span>Use for Today's Workout</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT COMPLETED WORKOUT SESSIONS */}
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
      {/* MODAL: ADD EXERCISE TO TODAY'S PLAN */}
      {/* ========================================================================= */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[85vh]">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Add Exercise to Today's Plan</h3>
                <p className="text-[11px] text-zinc-400">Click any exercise to immediately add it to today's workout</p>
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
                      <p className="text-[10px] text-zinc-400">{ex.muscle_group} · {ex.equipment}</p>
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
    </div>
  );
}
