"use client";

import { useState, useEffect } from "react";
import {
  Timer,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Eye,
  Sliders,
  Layers,
  X,
  Search,
  Check,
  ChevronDown,
} from "lucide-react";
import {
  WorkoutSession,
  WorkoutSet,
  Exercise,
  WorkoutSetType,
} from "@/types/database";

interface ActiveWorkoutViewProps {
  session: WorkoutSession;
  exercises: Exercise[];
  onUpdateSet: (sessionId: string, setId: string, updates: Partial<WorkoutSet>) => void;
  onAddSet: (sessionId: string, exerciseId: string) => void;
  onDeleteSet?: (sessionId: string, setId: string) => void;
  onAddExerciseToSession?: (
    sessionId: string,
    exerciseId: string,
    initialSetsCount?: number,
    targetWeight?: number,
    targetReps?: number
  ) => void;
  onFinishWorkout: (sessionId: string, notes?: string) => void;
  onDiscardWorkout: (sessionId: string) => void;
}

type MobileLayoutMode = "spotlight" | "table" | "stacked";

export function ActiveWorkoutView({
  session,
  exercises,
  onUpdateSet,
  onAddSet,
  onDeleteSet,
  onAddExerciseToSession,
  onFinishWorkout,
  onDiscardWorkout,
}: ActiveWorkoutViewProps) {
  // Session duration timer
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Rest Countdown Timer (default 90s, lifter never forced)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [isRestActive, setIsRestActive] = useState(false);

  // Mobile Ergonomic Layout Toggle
  const [mobileLayout, setMobileLayout] = useState<MobileLayoutMode>("spotlight");

  // Modal to add an exercise during workout
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [exerciseSearchQuery, setExerciseSearchQuery] = useState("");
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState("All");

  const [notes, setNotes] = useState(session.notes || "");

  // Track elapsed session time
  useEffect(() => {
    const startTime = new Date(session.started_at).getTime();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.max(0, Math.floor((Date.now() - startTime) / 1000)));
    }, 1000);
    return () => clearInterval(interval);
  }, [session.started_at]);

  // Rest timer countdown
  useEffect(() => {
    if (!isRestActive || restSecondsRemaining === null || restSecondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setRestSecondsRemaining((prev) => {
        if (prev && prev > 1) return prev - 1;
        setIsRestActive(false);
        return 0;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRestActive, restSecondsRemaining]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const sets = session.sets || [];
  // Distinct exercise IDs in session in order of appearance
  const exerciseIds: string[] = [];
  sets.forEach((s) => {
    if (!exerciseIds.includes(s.exercise_id)) {
      exerciseIds.push(s.exercise_id);
    }
  });

  // Calculate volume
  const completedSets = sets.filter((s) => s.is_completed);
  const totalVolume = completedSets.reduce((acc, s) => acc + s.weight_kg * s.reps, 0);

  // Toggle set completion (Starts 90s rest countdown, NEVER forces next set)
  const handleToggleSetComplete = (set: WorkoutSet) => {
    const newStatus = !set.is_completed;
    onUpdateSet(session.id, set.id, { is_completed: newStatus });
    if (newStatus) {
      setRestSecondsRemaining(90);
      setIsRestActive(true);
    }
  };

  // Steppers for weight and reps
  const handleAdjustWeight = (set: WorkoutSet, delta: number) => {
    const newWeight = Math.max(0, Number((set.weight_kg + delta).toFixed(1)));
    onUpdateSet(session.id, set.id, { weight_kg: newWeight });
  };

  const handleAdjustReps = (set: WorkoutSet, delta: number) => {
    const newReps = Math.max(1, set.reps + delta);
    onUpdateSet(session.id, set.id, { reps: newReps });
  };

  // Cycle set type: Normal -> Warmup -> Drop Set -> Failure
  const handleCycleSetType = (set: WorkoutSet) => {
    const types: WorkoutSetType[] = ["normal", "warmup", "dropset", "failure"];
    const currentIdx = types.indexOf(set.set_type);
    const nextIdx = (currentIdx + 1) % types.length;
    onUpdateSet(session.id, set.id, { set_type: types[nextIdx] });
  };

  const getSetTypeBadge = (type: WorkoutSetType, setNum: number) => {
    switch (type) {
      case "warmup":
        return (
          <span
            className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold text-[11px] flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0"
            title="Warmup Set (Tap to cycle)"
          >
            W
          </span>
        );
      case "dropset":
        return (
          <span
            className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-extrabold text-[11px] flex items-center justify-center border border-cyan-500/40 shadow-sm shrink-0"
            title="Drop Set (Tap to cycle)"
          >
            D
          </span>
        );
      case "failure":
        return (
          <span
            className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-extrabold text-[11px] flex items-center justify-center border border-rose-500/40 shadow-sm shrink-0"
            title="Failure Set (Tap to cycle)"
          >
            F
          </span>
        );
      case "normal":
      default:
        return (
          <span
            className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-[11px] flex items-center justify-center border border-zinc-700/60 shadow-sm shrink-0"
            title={`Working Set ${setNum} (Tap to cycle)`}
          >
            {setNum}
          </span>
        );
    }
  };

  const muscleGroups = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
  const filteredModalExercises = exercises.filter((ex) => {
    const matchesMuscle =
      selectedMuscleFilter === "All" || ex.muscle_group === selectedMuscleFilter;
    const matchesSearch =
      ex.name.toLowerCase().includes(exerciseSearchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(exerciseSearchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-24 max-w-4xl mx-auto animate-fade-in">
      {/* 1. TOP SESSION ACTION BAR */}
      <div className="bg-[#141417] border border-violet-500/40 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-md sticky top-14 z-30 space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (confirm("Discard this workout? Recorded sets will not be saved.")) {
                onDiscardWorkout(session.id);
              }
            }}
            className="text-xs text-zinc-500 hover:text-red-400 font-semibold transition"
          >
            Discard
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1 border border-[#27272a] transition"
            >
              <Plus className="w-3.5 h-3.5 text-violet-400" />
              <span>Add Exercise</span>
            </button>

            <button
              onClick={() => onFinishWorkout(session.id, notes)}
              className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition active:scale-95"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Finish Workout</span>
            </button>
          </div>
        </div>

        {/* Title & 3-Metric Recessed Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Live Gym Session
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white truncate">
                {session.name}
              </h2>
            </div>

            <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 shrink-0">
              {exerciseIds.length} Exercises
            </span>
          </div>

          {/* 3 Metrics: Time, Volume, Sets */}
          <div className="grid grid-cols-3 divide-x divide-zinc-800 bg-[#18181b] border border-[#27272a] rounded-xl p-2 text-center">
            <div>
              <div className="text-[9px] text-zinc-400 uppercase font-semibold">Time</div>
              <div className="text-xs sm:text-sm font-bold text-white font-mono">
                {formatTime(elapsedSeconds)}
              </div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-400 uppercase font-semibold">Volume</div>
              <div className="text-xs sm:text-sm font-bold text-violet-400 font-mono">
                {totalVolume.toLocaleString()}{" "}
                <span className="text-[9px] text-zinc-400">kg</span>
              </div>
            </div>
            <div>
              <div className="text-[9px] text-zinc-400 uppercase font-semibold">Sets Done</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-400 font-mono">
                {completedSets.length} / {sets.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. REST COUNTDOWN TIMER BAR (90s Default, Non-Forcing) */}
      <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-3 sm:p-4 shadow-lg space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Timer
              className={`w-3.5 h-3.5 ${
                isRestActive ? "text-violet-400 animate-pulse" : "text-zinc-500"
              }`}
            />
            <span className="text-xs font-bold text-zinc-200">Rest Timer (90s)</span>
            <span className="text-[10px] text-zinc-500 hidden sm:inline">
              · Lifter in complete control
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-violet-400">
            {restSecondsRemaining !== null && restSecondsRemaining > 0
              ? formatTime(restSecondsRemaining)
              : "00:00"}
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 to-emerald-400 transition-all duration-1000"
            style={{
              width: `${Math.min(
                100,
                Math.round(((90 - (restSecondsRemaining || 0)) / 90) * 100)
              )}%`,
            }}
          />
        </div>

        {/* Stepper Controls */}
        <div className="flex items-center justify-between gap-1.5 text-xs pt-0.5">
          <button
            onClick={() => setRestSecondsRemaining((prev) => Math.max(0, (prev || 0) - 30))}
            className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-center border border-[#27272a] active:scale-95 transition"
            title="Subtract 30s"
          >
            -30s
          </button>
          <button
            onClick={() => setRestSecondsRemaining((prev) => (prev || 0) + 30)}
            className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-center border border-[#27272a] active:scale-95 transition"
            title="Add 30s"
          >
            +30s
          </button>
          <button
            onClick={() => {
              setRestSecondsRemaining(null);
              setIsRestActive(false);
            }}
            className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-red-950/60 hover:text-red-400 text-zinc-400 font-medium active:scale-95 transition"
          >
            Skip
          </button>
        </div>
      </div>

      {/* 3. MOBILE SCREEN OPTIMIZATION TOGGLE */}
      <div className="bg-gradient-to-r from-violet-950/40 via-[#141417] to-[#141417] border border-violet-500/30 rounded-2xl p-3 sm:p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
              Set Row View Style
            </span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-bold">
              Anti-Clutter
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 hidden sm:inline">
            Choose your preferred logging layout
          </span>
        </div>

        {/* Segmented 3-Way Layout Buttons */}
        <div className="grid grid-cols-3 gap-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a] w-full">
          <button
            onClick={() => setMobileLayout("spotlight")}
            className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
              mobileLayout === "spotlight"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
            title="Completed sets collapse; active set expands with large sweaty-hand steppers"
          >
            <Eye className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Spotlight</span>
          </button>
          <button
            onClick={() => setMobileLayout("table")}
            className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
              mobileLayout === "table"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
            title="Clean minimalist table without inline stepper crowding"
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Hevy Table</span>
          </button>
          <button
            onClick={() => setMobileLayout("stacked")}
            className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
              mobileLayout === "stacked"
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
            title="2-tier cards with 50/50 blocks for weight and reps"
          >
            <Layers className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Stacked</span>
          </button>
        </div>
      </div>

      {/* 4. ACTIVE EXERCISES LIST */}
      <div className="space-y-3 sm:space-y-4">
        {exerciseIds.length === 0 ? (
          <div className="bg-[#141417] border border-dashed border-[#27272a] rounded-2xl p-8 text-center space-y-3">
            <p className="text-xs text-zinc-400">
              No exercises in this workout session yet.
            </p>
            <button
              onClick={() => setIsAddExerciseModalOpen(true)}
              className="py-2 px-4 rounded-xl bg-violet-600 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-md shadow-violet-600/30"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Exercise</span>
            </button>
          </div>
        ) : (
          exerciseIds.map((exId, exIdx) => {
            const exercise = exercises.find((e) => e.id === exId);
            const exerciseSets = sets.filter((s) => s.exercise_id === exId);
            const completedCount = exerciseSets.filter((s) => s.is_completed).length;
            const firstUncompletedId = exerciseSets.find((s) => !s.is_completed)?.id;

            return (
              <div
                key={exId}
                className="bg-[#141417] border border-[#27272a] rounded-2xl p-3 sm:p-4 shadow-lg space-y-3"
              >
                {/* Exercise Header */}
                <div className="flex items-center justify-between border-b border-[#27272a] pb-2.5 gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 font-bold flex items-center justify-center text-sm border border-violet-500/20 shrink-0">
                      🏋️
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                          {exercise?.name || "Exercise"}
                        </h3>
                        <span className="text-[9px] font-semibold text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                          {exercise?.muscle_group || "General"}
                        </span>
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-zinc-400 line-clamp-1">
                        {exercise?.equipment || "Standard"} ·{" "}
                        <span className="text-emerald-400 font-medium">
                          {completedCount}/{exerciseSets.length} Sets Completed
                        </span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => onAddSet(session.id, exId)}
                    className="py-1 px-2 rounded-lg bg-zinc-800 hover:bg-violet-900/40 hover:text-violet-300 text-[11px] sm:text-xs font-semibold text-zinc-200 border border-[#27272a] flex items-center gap-1 transition active:scale-95 shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Set</span>
                  </button>
                </div>

                {/* ================= OPTION 1: SPOTLIGHT MODE ================= */}
                {mobileLayout === "spotlight" && (
                  <div className="space-y-2">
                    {exerciseSets.map((s) => {
                      const isSpotlight = s.id === firstUncompletedId;
                      const isDone = s.is_completed;

                      if (isDone) {
                        return (
                          <div
                            key={s.id}
                            className="p-2 sm:p-2.5 px-3 rounded-xl bg-[#18181b]/70 border border-emerald-500/30 flex items-center justify-between transition hover:border-emerald-500/60"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <button
                                onClick={() => handleCycleSetType(s)}
                                className="shrink-0"
                              >
                                {getSetTypeBadge(s.set_type, s.set_number)}
                              </button>
                              <span className="text-xs font-bold text-zinc-300 shrink-0">
                                Set {s.set_number}:
                              </span>
                              <span className="text-xs font-mono font-bold text-emerald-400 truncate">
                                {s.weight_kg} kg × {s.reps} reps
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() => handleToggleSetComplete(s)}
                                className="text-[11px] text-zinc-500 hover:text-zinc-300 underline"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleToggleSetComplete(s)}
                                className="w-7 h-7 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      }

                      if (isSpotlight) {
                        return (
                          <div
                            key={s.id}
                            className="p-3 sm:p-3.5 rounded-2xl bg-gradient-to-b from-[#1c1c22] to-[#141417] border-2 border-violet-500 shadow-xl shadow-violet-950/20 space-y-2.5 animate-fade-in"
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button onClick={() => handleCycleSetType(s)}>
                                  {getSetTypeBadge(s.set_type, s.set_number)}
                                </button>
                                <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                                  Current Set {s.set_number}
                                </span>
                              </div>

                              {onDeleteSet && exerciseSets.length > 1 && (
                                <button
                                  onClick={() => onDeleteSet(session.id, s.id)}
                                  className="text-zinc-500 hover:text-rose-400 transition p-1"
                                  title="Delete this set"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* Sweaty-Hand Stepper Controls */}
                            <div className="grid grid-cols-2 gap-2 sm:gap-3">
                              {/* Weight Control */}
                              <div className="bg-[#121215] p-2 sm:p-2.5 rounded-xl border border-zinc-700 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                                  <span>Weight</span>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => handleAdjustWeight(s, -2.5)}
                                      className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-bold hover:bg-zinc-700 active:scale-95 transition"
                                    >
                                      -2.5
                                    </button>
                                    <button
                                      onClick={() => handleAdjustWeight(s, 2.5)}
                                      className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-bold hover:bg-zinc-700 active:scale-95 transition"
                                    >
                                      +2.5
                                    </button>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                  <button
                                    onClick={() => handleAdjustWeight(s, -1)}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-base border border-zinc-700 active:scale-95 transition flex items-center justify-center shrink-0"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={s.weight_kg}
                                    onChange={(e) =>
                                      onUpdateSet(session.id, s.id, {
                                        weight_kg: parseFloat(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full text-center bg-transparent text-lg sm:text-xl font-black text-white font-mono tracking-tight outline-none"
                                  />
                                  <button
                                    onClick={() => handleAdjustWeight(s, 1)}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-base border border-zinc-700 active:scale-95 transition flex items-center justify-center shrink-0"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Reps Control */}
                              <div className="bg-[#121215] p-2 sm:p-2.5 rounded-xl border border-zinc-700 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                                  <span>Reps</span>
                                  <span className="text-[10px] text-violet-400 font-mono">
                                    count
                                  </span>
                                </div>
                                <div className="flex items-center justify-between gap-1">
                                  <button
                                    onClick={() => handleAdjustReps(s, -1)}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-base border border-zinc-700 active:scale-95 transition flex items-center justify-center shrink-0"
                                  >
                                    -
                                  </button>
                                  <input
                                    type="number"
                                    value={s.reps}
                                    onChange={(e) =>
                                      onUpdateSet(session.id, s.id, {
                                        reps: parseInt(e.target.value) || 0,
                                      })
                                    }
                                    className="w-full text-center bg-transparent text-lg sm:text-xl font-black text-white font-mono tracking-tight outline-none"
                                  />
                                  <button
                                    onClick={() => handleAdjustReps(s, 1)}
                                    className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-base border border-zinc-700 active:scale-95 transition flex items-center justify-center shrink-0"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Big Log Button */}
                            <button
                              onClick={() => handleToggleSetComplete(s)}
                              className="w-full py-2.5 sm:py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition active:scale-98"
                            >
                              <CheckCircle2 className="w-4 h-4 fill-white stroke-violet-600" />
                              <span>Log Set {s.set_number} & Start Rest</span>
                            </button>
                          </div>
                        );
                      }

                      // Upcoming Sets
                      return (
                        <div
                          key={s.id}
                          onClick={() => handleToggleSetComplete(s)}
                          className="p-2 sm:p-2.5 px-3 rounded-xl bg-[#141417] border border-[#27272a] flex items-center justify-between cursor-pointer hover:border-zinc-700 opacity-60 hover:opacity-100 transition"
                        >
                          <div className="flex items-center gap-2">
                            {getSetTypeBadge(s.set_type, s.set_number)}
                            <span className="text-xs font-semibold text-zinc-400">
                              Set {s.set_number}: {s.weight_kg} kg × {s.reps} reps
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            Tap to focus
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* ================= OPTION 2: HEVY TABLE MODE ================= */}
                {mobileLayout === "table" && (
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-[32px_1fr_58px_50px_36px] items-center gap-1.5 px-2 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      <div className="text-center">Set</div>
                      <div>Type</div>
                      <div className="text-center">Kg</div>
                      <div className="text-center">Reps</div>
                      <div className="text-center">Log</div>
                    </div>

                    {exerciseSets.map((s) => (
                      <div
                        key={s.id}
                        className={`grid grid-cols-[32px_1fr_58px_50px_36px] items-center gap-1.5 p-2 rounded-xl border transition ${
                          s.is_completed
                            ? "bg-[#18181b]/90 border-emerald-500/40"
                            : "bg-[#18181b] border-[#27272a] hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-center">
                          <button onClick={() => handleCycleSetType(s)}>
                            {getSetTypeBadge(s.set_type, s.set_number)}
                          </button>
                        </div>

                        <div className="text-[11px] font-mono text-zinc-400 uppercase truncate">
                          {s.set_type}
                        </div>

                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            step="0.5"
                            value={s.weight_kg}
                            onChange={(e) =>
                              onUpdateSet(session.id, s.id, {
                                weight_kg: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-14 h-8 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="flex items-center justify-center">
                          <input
                            type="number"
                            value={s.reps}
                            onChange={(e) =>
                              onUpdateSet(session.id, s.id, {
                                reps: parseInt(e.target.value) || 0,
                              })
                            }
                            className="w-12 h-8 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:border-violet-500"
                          />
                        </div>

                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleToggleSetComplete(s)}
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition active:scale-95 ${
                              s.is_completed
                                ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                : "bg-zinc-800 text-zinc-400 hover:text-white"
                            }`}
                          >
                            {s.is_completed ? (
                              <CheckCircle2 className="w-4 h-4 fill-white stroke-emerald-600" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* ================= OPTION 3: STACKED CARDS MODE ================= */}
                {mobileLayout === "stacked" && (
                  <div className="space-y-2">
                    {exerciseSets.map((s) => (
                      <div
                        key={s.id}
                        className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
                          s.is_completed
                            ? "bg-[#18181b]/90 border-emerald-500/40 shadow-sm"
                            : "bg-[#141417] border-[#27272a] hover:border-violet-500/40"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => handleCycleSetType(s)}>
                              {getSetTypeBadge(s.set_type, s.set_number)}
                            </button>
                            <span className="text-xs font-bold text-white">
                              Set {s.set_number} ·{" "}
                              <span className="text-zinc-500 uppercase">{s.set_type}</span>
                            </span>
                          </div>

                          <button
                            onClick={() => handleToggleSetComplete(s)}
                            className={`py-1 px-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition active:scale-95 ${
                              s.is_completed
                                ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/30"
                                : "bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-[#27272a]"
                            }`}
                          >
                            {s.is_completed ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 fill-white stroke-emerald-600" />
                                <span>Done</span>
                              </>
                            ) : (
                              <>
                                <Circle className="w-3.5 h-3.5" />
                                <span>Log</span>
                              </>
                            )}
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#27272a]/70">
                          {/* Weight Steppers */}
                          <div className="bg-[#18181b] p-1.5 sm:p-2 rounded-xl border border-[#27272a] space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                              <span>Weight</span>
                              <span className="text-violet-400 font-mono">kg</span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <button
                                onClick={() => handleAdjustWeight(s, -2.5)}
                                className="h-8 px-1.5 sm:px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[11px] border border-[#27272a] active:scale-95 transition shrink-0"
                              >
                                -2.5
                              </button>
                              <input
                                type="number"
                                step="0.5"
                                value={s.weight_kg}
                                onChange={(e) =>
                                  onUpdateSet(session.id, s.id, {
                                    weight_kg: parseFloat(e.target.value) || 0,
                                  })
                                }
                                className="w-full min-w-0 h-8 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none"
                              />
                              <button
                                onClick={() => handleAdjustWeight(s, 2.5)}
                                className="h-8 px-1.5 sm:px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-[11px] border border-[#27272a] active:scale-95 transition shrink-0"
                              >
                                +2.5
                              </button>
                            </div>
                          </div>

                          {/* Reps Steppers */}
                          <div className="bg-[#18181b] p-1.5 sm:p-2 rounded-xl border border-[#27272a] space-y-1">
                            <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                              <span>Reps</span>
                              <span className="text-violet-400 font-mono">count</span>
                            </div>
                            <div className="flex items-center justify-between gap-1">
                              <button
                                onClick={() => handleAdjustReps(s, -1)}
                                className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm border border-[#27272a] active:scale-95 transition flex items-center justify-center shrink-0"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={s.reps}
                                onChange={(e) =>
                                  onUpdateSet(session.id, s.id, {
                                    reps: parseInt(e.target.value) || 0,
                                  })
                                }
                                className="w-full min-w-0 h-8 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none"
                              />
                              <button
                                onClick={() => handleAdjustReps(s, 1)}
                                className="h-8 w-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-sm border border-[#27272a] active:scale-95 transition flex items-center justify-center shrink-0"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. ADD EXERCISE CTA */}
      <button
        onClick={() => setIsAddExerciseModalOpen(true)}
        className="w-full py-3 rounded-2xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-dashed border-[#27272a] hover:border-violet-500/60 text-xs font-bold text-zinc-300 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-95"
      >
        <Plus className="w-4 h-4 text-violet-400" />
        <span>+ Add Exercise to Current Workout</span>
      </button>

      {/* 6. SESSION NOTES */}
      <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 space-y-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block">
          Session Notes & Reflection
        </label>
        <textarea
          placeholder="e.g. Felt strong on bench press today, no shoulder pain..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          className="w-full p-2.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500 resize-none"
        />
      </div>

      {/* MODAL: ADD EXERCISE TO ACTIVE WORKOUT */}
      {isAddExerciseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[85vh]">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Add Exercise to Workout</h3>
                <p className="text-[11px] text-zinc-400">Select an exercise to add to this session</p>
              </div>
              <button
                onClick={() => setIsAddExerciseModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 border-b border-[#27272a] space-y-2">
              {/* Muscle Filters */}
              <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
                {muscleGroups.map((m) => (
                  <button
                    key={m}
                    onClick={() => setSelectedMuscleFilter(m)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold shrink-0 transition ${
                      selectedMuscleFilter === m
                        ? "bg-violet-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search exercise..."
                  value={exerciseSearchQuery}
                  onChange={(e) => setExerciseSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>
            </div>

            <div className="p-3 overflow-y-auto space-y-1.5 max-h-72">
              {filteredModalExercises.map((ex) => (
                <div
                  key={ex.id}
                  onClick={() => {
                    if (onAddExerciseToSession) {
                      onAddExerciseToSession(session.id, ex.id, 3, 20, 10);
                    } else {
                      onAddSet(session.id, ex.id);
                    }
                    setIsAddExerciseModalOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-violet-500/50 flex items-center justify-between cursor-pointer transition active:scale-98"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{ex.name}</h4>
                    <p className="text-[10px] text-zinc-400">
                      {ex.muscle_group} · {ex.equipment}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-violet-400" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
