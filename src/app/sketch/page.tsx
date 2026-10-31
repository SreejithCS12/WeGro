"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Flame,
  Droplets,
  Dumbbell,
  Scale,
  Plus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Utensils,
  TrendingUp,
  Settings,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Timer,
  CheckCircle2,
  Circle,
  Trash2,
  X,
  Play,
  RotateCcw,
  Layers,
  ChevronDown,
  ChevronUp,
  Check,
  Search,
  Sliders,
  Eye,
  Info,
  CalendarDays,
  Clock,
  ArrowRight,
  Edit3,
} from "lucide-react";
import { INITIAL_EXERCISES } from "@/lib/data/seed";

type ViewMode = "auto" | "desktop" | "tablet" | "mobile";
type ModuleMode = "module2" | "module3";
type WorkoutFlowStep = "staging" | "active" | "summary";
type SetType = "normal" | "warmup" | "drop" | "failure";
type MobileLayoutMode = "spotlight" | "table" | "stacked";

interface WorkoutSetItem {
  id: string;
  setNumber: number;
  type: SetType;
  weight: number;
  reps: number;
  isCompleted: boolean;
  prevBest?: string;
}

interface RoutineExerciseConfig {
  exerciseId: string;
  name: string;
  muscle: string;
  equipment: string;
  targetSets: number;
  targetReps: string;
  defaultWeight: number;
  sets: WorkoutSetItem[];
}

interface RoutineOption {
  id: string;
  name: string;
  splitType: string;
  description: string;
  exercises: RoutineExerciseConfig[];
}

interface DaySchedule {
  dayName: string;
  dayShort: string;
  dayIndex: number; // 1=Mon, 2=Tue...
  routineId: string | null; // null = Rest day
  isToday?: boolean;
}

// Built-in split presets
const INITIAL_PRESET_ROUTINES: RoutineOption[] = [
  {
    id: "split-chest-tricep",
    name: "Chest & Triceps (Hypertrophy)",
    splitType: "Target Day Split",
    description: "Heavy horizontal/incline pressing paired with triceps lockout isolations.",
    exercises: [
      {
        exerciseId: "ex-c1",
        name: "Barbell Bench Press",
        muscle: "Chest",
        equipment: "Barbell",
        targetSets: 4,
        targetReps: "8-10",
        defaultWeight: 75,
        sets: [
          { id: "ct-1", setNumber: 1, type: "warmup", weight: 50, reps: 12, isCompleted: true, prevBest: "50kg × 12" },
          { id: "ct-2", setNumber: 2, type: "normal", weight: 75, reps: 10, isCompleted: true, prevBest: "75kg × 10" },
          { id: "ct-3", setNumber: 3, type: "normal", weight: 80, reps: 8, isCompleted: false, prevBest: "80kg × 8" },
          { id: "ct-4", setNumber: 4, type: "drop", weight: 60, reps: 12, isCompleted: false, prevBest: "60kg × 10" },
        ],
      },
      {
        exerciseId: "ex-c2",
        name: "Incline Dumbbell Press",
        muscle: "Chest",
        equipment: "Dumbbells",
        targetSets: 3,
        targetReps: "10-12",
        defaultWeight: 26,
        sets: [
          { id: "ct-5", setNumber: 1, type: "normal", weight: 26, reps: 10, isCompleted: false, prevBest: "26kg × 10" },
          { id: "ct-6", setNumber: 2, type: "normal", weight: 28, reps: 8, isCompleted: false, prevBest: "28kg × 8" },
          { id: "ct-7", setNumber: 3, type: "failure", weight: 28, reps: 8, isCompleted: false, prevBest: "28kg × 7" },
        ],
      },
      {
        exerciseId: "ex-a4",
        name: "Tricep Rope Pushdown",
        muscle: "Arms",
        equipment: "Cable",
        targetSets: 4,
        targetReps: "12-15",
        defaultWeight: 25,
        sets: [
          { id: "ct-8", setNumber: 1, type: "normal", weight: 22.5, reps: 15, isCompleted: false, prevBest: "22.5kg × 14" },
          { id: "ct-9", setNumber: 2, type: "normal", weight: 25, reps: 12, isCompleted: false, prevBest: "25kg × 12" },
          { id: "ct-10", setNumber: 3, type: "failure", weight: 25, reps: 10, isCompleted: false, prevBest: "25kg × 10" },
        ],
      },
      {
        exerciseId: "ex-a5",
        name: "Skull Crushers (EZ Bar)",
        muscle: "Arms",
        equipment: "Barbell",
        targetSets: 3,
        targetReps: "10-12",
        defaultWeight: 22.5,
        sets: [
          { id: "ct-11", setNumber: 1, type: "normal", weight: 20, reps: 12, isCompleted: false, prevBest: "20kg × 12" },
          { id: "ct-12", setNumber: 2, type: "normal", weight: 22.5, reps: 10, isCompleted: false, prevBest: "22.5kg × 10" },
        ],
      },
    ],
  },
  {
    id: "split-back-bicep",
    name: "Back & Biceps (Pull Split)",
    splitType: "Target Day Split",
    description: "Vertical pull width and horizontal row thickness paired with arm curls.",
    exercises: [
      {
        exerciseId: "ex-b3",
        name: "Lat Pulldown (Wide Grip)",
        muscle: "Back",
        equipment: "Cable",
        targetSets: 4,
        targetReps: "8-10",
        defaultWeight: 60,
        sets: [
          { id: "bb-1", setNumber: 1, type: "warmup", weight: 40, reps: 12, isCompleted: false, prevBest: "40kg × 12" },
          { id: "bb-2", setNumber: 2, type: "normal", weight: 60, reps: 10, isCompleted: false, prevBest: "55kg × 10" },
          { id: "bb-3", setNumber: 3, type: "normal", weight: 65, reps: 8, isCompleted: false, prevBest: "60kg × 8" },
        ],
      },
      {
        exerciseId: "ex-b4",
        name: "Seated Cable Row",
        muscle: "Back",
        equipment: "Cable",
        targetSets: 3,
        targetReps: "10-12",
        defaultWeight: 50,
        sets: [
          { id: "bb-4", setNumber: 1, type: "normal", weight: 50, reps: 10, isCompleted: false, prevBest: "50kg × 10" },
          { id: "bb-5", setNumber: 2, type: "normal", weight: 55, reps: 9, isCompleted: false, prevBest: "50kg × 10" },
        ],
      },
      {
        exerciseId: "ex-a1",
        name: "Barbell Bicep Curl",
        muscle: "Arms",
        equipment: "Barbell",
        targetSets: 3,
        targetReps: "10-12",
        defaultWeight: 25,
        sets: [
          { id: "bb-6", setNumber: 1, type: "normal", weight: 22.5, reps: 12, isCompleted: false, prevBest: "22.5kg × 12" },
          { id: "bb-7", setNumber: 2, type: "normal", weight: 25, reps: 10, isCompleted: false, prevBest: "25kg × 10" },
        ],
      },
      {
        exerciseId: "ex-a2",
        name: "Dumbbell Hammer Curl",
        muscle: "Arms",
        equipment: "Dumbbell",
        targetSets: 3,
        targetReps: "12",
        defaultWeight: 14,
        sets: [
          { id: "bb-9", setNumber: 1, type: "normal", weight: 14, reps: 12, isCompleted: false, prevBest: "14kg × 12" },
        ],
      },
    ],
  },
  {
    id: "split-shoulders-abs",
    name: "Shoulders & Abs (Delts Focus)",
    splitType: "Target Day Split",
    description: "Strict vertical pressing, lateral delt caps, and abdominal flexion.",
    exercises: [
      {
        exerciseId: "ex-s1",
        name: "Overhead Barbell Press (OHP)",
        muscle: "Shoulders",
        equipment: "Barbell",
        targetSets: 4,
        targetReps: "6-8",
        defaultWeight: 45,
        sets: [
          { id: "sa-1", setNumber: 1, type: "warmup", weight: 30, reps: 10, isCompleted: false },
          { id: "sa-2", setNumber: 2, type: "normal", weight: 45, reps: 8, isCompleted: false },
        ],
      },
      {
        exerciseId: "ex-s3",
        name: "Dumbbell Lateral Raise",
        muscle: "Shoulders",
        equipment: "Dumbbell",
        targetSets: 4,
        targetReps: "12-15",
        defaultWeight: 10,
        sets: [
          { id: "sa-4", setNumber: 1, type: "normal", weight: 10, reps: 15, isCompleted: false },
        ],
      },
      {
        exerciseId: "ex-co1",
        name: "Hanging Leg Raise",
        muscle: "Core",
        equipment: "Bodyweight",
        targetSets: 3,
        targetReps: "15",
        defaultWeight: 0,
        sets: [
          { id: "sa-6", setNumber: 1, type: "normal", weight: 0, reps: 15, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "split-legs-calves",
    name: "Legs & Calves (Lower Overload)",
    splitType: "Target Day Split",
    description: "Deep barbell squats, hamstring hinges, and calf stretch isolations.",
    exercises: [
      {
        exerciseId: "ex-l1",
        name: "Barbell Back Squat",
        muscle: "Legs",
        equipment: "Barbell",
        targetSets: 4,
        targetReps: "6-8",
        defaultWeight: 90,
        sets: [
          { id: "lc-1", setNumber: 1, type: "warmup", weight: 60, reps: 10, isCompleted: false },
          { id: "lc-2", setNumber: 2, type: "normal", weight: 90, reps: 8, isCompleted: false },
        ],
      },
      {
        exerciseId: "ex-l3",
        name: "Romanian Deadlift (RDL)",
        muscle: "Legs",
        equipment: "Barbell",
        targetSets: 3,
        targetReps: "8-10",
        defaultWeight: 80,
        sets: [
          { id: "lc-4", setNumber: 1, type: "normal", weight: 80, reps: 10, isCompleted: false },
        ],
      },
      {
        exerciseId: "ex-l9",
        name: "Standing Calf Raise",
        muscle: "Legs",
        equipment: "Machine",
        targetSets: 4,
        targetReps: "15",
        defaultWeight: 45,
        sets: [
          { id: "lc-6", setNumber: 1, type: "normal", weight: 45, reps: 15, isCompleted: false },
        ],
      },
    ],
  },
  {
    id: "split-ppl-push",
    name: "Push Day (Classic PPL)",
    splitType: "PPL Rotation",
    description: "Traditional compound chest, shoulder press, and tricep push.",
    exercises: [
      {
        exerciseId: "ex-c1",
        name: "Barbell Bench Press",
        muscle: "Chest",
        equipment: "Barbell",
        targetSets: 4,
        targetReps: "8-10",
        defaultWeight: 75,
        sets: [
          { id: "ppl-1", setNumber: 1, type: "warmup", weight: 50, reps: 12, isCompleted: false },
          { id: "ppl-2", setNumber: 2, type: "normal", weight: 75, reps: 10, isCompleted: false },
        ],
      },
    ],
  },
];

// 7-Day Weekly Training Schedule Preset (Lifter's plan)
const DEFAULT_WEEKLY_SCHEDULE: DaySchedule[] = [
  { dayName: "Monday", dayShort: "Mon", dayIndex: 1, routineId: "split-chest-tricep", isToday: true },
  { dayName: "Tuesday", dayShort: "Tue", dayIndex: 2, routineId: "split-back-bicep" },
  { dayName: "Wednesday", dayShort: "Wed", dayIndex: 3, routineId: null }, // Rest day
  { dayName: "Thursday", dayShort: "Thu", dayIndex: 4, routineId: "split-shoulders-abs" },
  { dayName: "Friday", dayShort: "Fri", dayIndex: 5, routineId: "split-legs-calves" },
  { dayName: "Saturday", dayShort: "Sat", dayIndex: 6, routineId: "split-ppl-push" },
  { dayName: "Sunday", dayShort: "Sun", dayIndex: 0, routineId: null }, // Rest day
];

export default function SketchPage() {
  const [activeModule, setActiveModule] = useState<ModuleMode>("module3");
  const [viewMode, setViewMode] = useState<ViewMode>("auto");

  // Workflow Step for Module 3:
  // "staging" = Pre-Workout Setup (Weekly Split + Today's Customizer)
  // "active"  = Active Gym Session (Steppers + 90s Timer)
  // "summary" = Workout Finished
  const [workoutStep, setWorkoutStep] = useState<WorkoutFlowStep>("staging");

  // Weekly Schedule State
  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(DEFAULT_WEEKLY_SCHEDULE);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(1); // 1 = Monday (Today)

  // Active selected day in weekly schedule
  const activeDay = useMemo(
    () => weeklySchedule.find((d) => d.dayIndex === selectedDayIndex) || weeklySchedule[0],
    [weeklySchedule, selectedDayIndex]
  );

  // Routine Library
  const [routines, setRoutines] = useState<RoutineOption[]>(INITIAL_PRESET_ROUTINES);

  // Today's Planned Routine & Exercises (Customizable before starting)
  const [todayRoutineId, setTodayRoutineId] = useState<string>("split-chest-tricep");
  const [isTodayRestDay, setIsTodayRestDay] = useState<boolean>(false);

  // Staged Exercises for Today (Lifter can add/remove/tweak before hitting Start)
  const [stagedExercises, setStagedExercises] = useState<RoutineExerciseConfig[]>(() => {
    const found = INITIAL_PRESET_ROUTINES.find((r) => r.id === "split-chest-tricep");
    return found ? JSON.parse(JSON.stringify(found.exercises)) : [];
  });

  // Mobile Layout Style: "spotlight" | "table" | "stacked"
  const [mobileLayout, setMobileLayout] = useState<MobileLayoutMode>("spotlight");

  // Active Session Timers
  const [sessionSeconds, setSessionSeconds] = useState(1455); // 24m 15s elapsed
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(90);
  const [isRestActive, setIsRestActive] = useState(false);

  // Scroll Container Ref
  const mainScrollRef = useRef<HTMLElement>(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Modals
  const [isRoutineBuilderOpen, setIsRoutineBuilderOpen] = useState(false);
  const [isAddExerciseModalOpen, setIsAddExerciseModalOpen] = useState(false);
  const [isWeeklyEditModalOpen, setIsWeeklyEditModalOpen] = useState(false);

  // Exercise Picker Search & Filter
  const [pickerMuscleFilter, setPickerMuscleFilter] = useState("All");
  const [pickerSearch, setPickerSearch] = useState("");

  const filteredPickerExercises = useMemo(() => {
    return INITIAL_EXERCISES.filter((ex) => {
      const matchMuscle =
        pickerMuscleFilter === "All" ||
        ex.muscle_group.toLowerCase().includes(pickerMuscleFilter.toLowerCase());
      const matchSearch =
        !pickerSearch ||
        ex.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
        ex.muscle_group.toLowerCase().includes(pickerSearch.toLowerCase());
      return matchMuscle && matchSearch;
    });
  }, [pickerMuscleFilter, pickerSearch]);

  // Routine Builder state
  const [newRoutineName, setNewRoutineName] = useState("Arm Blaster");
  const [builderMuscleFilter, setBuilderMuscleFilter] = useState("All");

  // Reset scroll to top whenever viewMode or step changes
  useEffect(() => {
    mainScrollRef.current?.scrollTo({ top: 0, behavior: "instant" });
  }, [viewMode, workoutStep]);

  // Elapsed Session Timer (Runs when in "active" mode)
  useEffect(() => {
    if (workoutStep !== "active") return;
    const timer = setInterval(() => {
      setSessionSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [workoutStep]);

  // Rest Countdown Timer
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

  const formatTime = (totalSecs: number) => {
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Switch Today's Split Focus
  const handleSwitchTodaySplit = (newRoutineId: string | null) => {
    if (newRoutineId === null) {
      setIsTodayRestDay(true);
      showToast("Day marked as Rest Day (Active Recovery)");
      return;
    }
    setIsTodayRestDay(false);
    setTodayRoutineId(newRoutineId);
    const selected = routines.find((r) => r.id === newRoutineId);
    if (selected) {
      setStagedExercises(JSON.parse(JSON.stringify(selected.exercises)));
      showToast(`Loaded routine: ${selected.name}`);
    }
  };

  // Reassign a Day in the Weekly Schedule
  const handleUpdateDaySchedule = (dayIndex: number, newRoutineId: string | null) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => (d.dayIndex === dayIndex ? { ...d, routineId: newRoutineId } : d))
    );
    // If updating currently viewed day, sync staging too
    if (dayIndex === selectedDayIndex) {
      handleSwitchTodaySplit(newRoutineId);
    }
  };

  // Staging: Reorder exercises
  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= stagedExercises.length) return;
    setStagedExercises((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
    showToast(`Moved ${direction === "up" ? "up" : "down"}: ${stagedExercises[index].name}`);
  };

  // Staging: Update Target Sets for an exercise
  const handleUpdateStagedSets = (index: number, delta: number) => {
    setStagedExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[index] };
      const newSetsCount = Math.max(1, Math.min(8, ex.targetSets + delta));
      ex.targetSets = newSetsCount;
      const currentSets = [...ex.sets];
      while (currentSets.length < newSetsCount) {
        const setNum = currentSets.length + 1;
        currentSets.push({
          id: `s-${Date.now()}-${setNum}`,
          setNumber: setNum,
          type: "normal",
          weight: ex.defaultWeight,
          reps: parseInt(ex.targetReps) || 10,
          isCompleted: false,
        });
      }
      if (currentSets.length > newSetsCount) {
        ex.sets = currentSets.slice(0, newSetsCount);
      } else {
        ex.sets = currentSets;
      }
      next[index] = ex;
      return next;
    });
  };

  // Staging: Update Target Weight for an exercise
  const handleUpdateStagedWeight = (index: number, delta: number) => {
    setStagedExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[index] };
      const newWeight = Math.max(0, Number((ex.defaultWeight + delta).toFixed(1)));
      ex.defaultWeight = newWeight;
      ex.sets = ex.sets.map((s) => ({ ...s, weight: newWeight }));
      next[index] = ex;
      return next;
    });
  };

  // Staging: Update Target Reps for an exercise
  const handleUpdateStagedReps = (index: number, reps: string) => {
    setStagedExercises((prev) => {
      const next = [...prev];
      const ex = { ...next[index], targetReps: reps };
      const num = parseInt(reps) || 10;
      ex.sets = ex.sets.map((s) => ({ ...s, reps: num }));
      next[index] = ex;
      return next;
    });
  };

  // Staging: Remove exercise from today's plan
  const handleRemoveStagedExercise = (index: number) => {
    const removedName = stagedExercises[index]?.name;
    setStagedExercises((prev) => prev.filter((_, i) => i !== index));
    if (removedName) showToast(`Removed ${removedName}`);
  };

  // Staging: Add exercise to today's plan from picker
  const handleAddExerciseToStaging = (exId: string) => {
    const raw = INITIAL_EXERCISES.find((e) => e.id === exId);
    if (!raw) return;
    const newEx: RoutineExerciseConfig = {
      exerciseId: raw.id,
      name: raw.name,
      muscle: raw.muscle_group,
      equipment: raw.equipment,
      targetSets: 3,
      targetReps: "10-12",
      defaultWeight: 20,
      sets: [
        { id: `s-${Date.now()}-1`, setNumber: 1, type: "normal", weight: 20, reps: 10, isCompleted: false },
        { id: `s-${Date.now()}-2`, setNumber: 2, type: "normal", weight: 20, reps: 10, isCompleted: false },
        { id: `s-${Date.now()}-3`, setNumber: 3, type: "normal", weight: 20, reps: 10, isCompleted: false },
      ],
    };
    setStagedExercises((prev) => [...prev, newEx]);
    setIsAddExerciseModalOpen(false);
    showToast(`Added ${raw.name} to today's workout!`);
  };

  // Start the Active Workout Session with the Customized Plan!
  const handleStartCustomizedSession = () => {
    if (stagedExercises.length === 0) {
      alert("Please add at least 1 exercise to today's workout before starting.");
      return;
    }
    setWorkoutStep("active");
    showToast("▶ Gym Session Started! Live timer is running.");
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  // Finish Workout
  const handleFinishWorkout = () => {
    setWorkoutStep("summary");
    showToast("🎉 Workout Finished! Volume logged.");
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  // Active Logger Handlers
  const handleToggleSet = (exerciseIdx: number, setId: string) => {
    setStagedExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exerciseIdx] };
      targetEx.sets = targetEx.sets.map((s) => {
        if (s.id !== setId) return s;
        const nextState = !s.isCompleted;
        if (nextState) {
          setRestSecondsRemaining(90);
          setIsRestActive(true);
        }
        return { ...s, isCompleted: nextState };
      });
      updated[exerciseIdx] = targetEx;
      return updated;
    });
  };

  const handleAdjustWeight = (exerciseIdx: number, setId: string, delta: number) => {
    setStagedExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exerciseIdx] };
      targetEx.sets = targetEx.sets.map((s) =>
        s.id === setId ? { ...s, weight: Math.max(0, Number((s.weight + delta).toFixed(1))) } : s
      );
      updated[exerciseIdx] = targetEx;
      return updated;
    });
  };

  const handleAdjustReps = (exerciseIdx: number, setId: string, delta: number) => {
    setStagedExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exerciseIdx] };
      targetEx.sets = targetEx.sets.map((s) =>
        s.id === setId ? { ...s, reps: Math.max(1, s.reps + delta) } : s
      );
      updated[exerciseIdx] = targetEx;
      return updated;
    });
  };

  const handleCycleSetType = (exerciseIdx: number, setId: string) => {
    const types: SetType[] = ["normal", "warmup", "drop", "failure"];
    setStagedExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exerciseIdx] };
      targetEx.sets = targetEx.sets.map((s) => {
        if (s.id !== setId) return s;
        const nextIdx = (types.indexOf(s.type) + 1) % types.length;
        return { ...s, type: types[nextIdx] };
      });
      updated[exerciseIdx] = targetEx;
      return updated;
    });
  };

  const handleAddSetToExercise = (exerciseIdx: number) => {
    setStagedExercises((prev) => {
      const updated = [...prev];
      const targetEx = { ...updated[exerciseIdx] };
      const last = targetEx.sets[targetEx.sets.length - 1];
      const newSet: WorkoutSetItem = {
        id: "set-" + Date.now(),
        setNumber: targetEx.sets.length + 1,
        type: "normal",
        weight: last ? last.weight : targetEx.defaultWeight,
        reps: last ? last.reps : 10,
        isCompleted: false,
        prevBest: last ? `${last.weight}kg × ${last.reps}` : undefined,
      };
      targetEx.sets = [...targetEx.sets, newSet];
      updated[exerciseIdx] = targetEx;
      return updated;
    });
  };

  // Calculations for Volume & Sets
  const allSets = stagedExercises.flatMap((ex) => ex.sets);
  const completedSets = allSets.filter((s) => s.isCompleted);
  const totalVolume = completedSets.reduce((acc, s) => acc + s.weight * s.reps, 0);

  const isMobileSim = viewMode === "mobile";

  const getContainerClass = () => {
    switch (viewMode) {
      case "desktop":
        return "w-full max-w-[1340px]";
      case "tablet":
        return "w-full max-w-[860px]";
      case "mobile":
        return "w-full max-w-[390px] mx-auto min-h-[720px] max-h-[850px] border-4 border-zinc-700/80 rounded-[44px]";
      case "auto":
      default:
        return "w-full max-w-7xl";
    }
  };

  const getSetTypeBadge = (type: SetType, setNum: number) => {
    switch (type) {
      case "warmup":
        return (
          <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-extrabold text-[11px] flex items-center justify-center border border-amber-500/40 shadow-sm shrink-0" title="Warmup">
            W
          </span>
        );
      case "drop":
        return (
          <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-extrabold text-[11px] flex items-center justify-center border border-cyan-500/40 shadow-sm shrink-0" title="Drop Set">
            D
          </span>
        );
      case "failure":
        return (
          <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 font-extrabold text-[11px] flex items-center justify-center border border-rose-500/40 shadow-sm shrink-0" title="Failure">
            F
          </span>
        );
      case "normal":
      default:
        return (
          <span className="w-6 h-6 rounded-lg bg-zinc-800 text-zinc-300 font-bold text-[11px] flex items-center justify-center border border-zinc-700/60 shadow-sm shrink-0" title="Working Set">
            {setNum}
          </span>
        );
    }
  };

  // Helper to get routine name by id
  const getRoutineName = (id: string | null) => {
    if (!id) return "Rest Day (Active Recovery)";
    return routines.find((r) => r.id === id)?.name || "Custom Split";
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] p-2 sm:p-5 flex flex-col items-center selection:bg-purple-500/30">
      {/* Top Controller Bar */}
      <div className="w-full max-w-7xl mb-3 sm:mb-4 bg-[#141417] border border-[#27272a] rounded-2xl p-3 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300 flex items-center gap-1.5 transition active:scale-95 shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to App</span>
          </Link>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold uppercase tracking-wider shrink-0">
                Wireframe Sketch
              </span>
              <h1 className="text-xs sm:text-sm font-bold text-white truncate">
                Weekly Split Planner & Today Staging
              </h1>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">
              Weekly Plan (Mon: Chest & Trice, Tue: Back & Bice...) + Today Customizer + Session Logger
            </p>
          </div>
        </div>

        {/* Viewport & Flow State Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Step Selector Pills */}
          <div className="flex items-center bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setWorkoutStep("staging")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                workoutStep === "staging"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              <span>1. Weekly & Today Plan</span>
            </button>
            <button
              onClick={() => setWorkoutStep("active")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                workoutStep === "active"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>2. Active Session</span>
            </button>
          </div>

          {/* Viewport Simulator */}
          <div className="flex items-center bg-[#09090b] p-1 rounded-xl border border-[#27272a]">
            <button
              onClick={() => setViewMode("auto")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "auto" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Auto</span>
            </button>
            <button
              onClick={() => setViewMode("desktop")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "desktop" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setViewMode("tablet")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "tablet" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setViewMode("mobile")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition ${
                viewMode === "mobile" ? "bg-violet-600 text-white shadow-md shadow-violet-600/30" : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Simulated Frame */}
      <div
        className={`${getContainerClass()} bg-[#09090b] border-2 border-[#27272a] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
          !isMobileSim && (viewMode === "desktop" || viewMode === "auto") ? "lg:flex-row" : ""
        } relative`}
      >
        {/* Mobile Device Notch Indicator when in Mobile View */}
        {isMobileSim && (
          <div className="w-full bg-[#141417] border-b border-[#27272a] py-2 px-3 flex items-center justify-between text-[11px] text-zinc-400 font-mono shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
              <span className="font-bold text-white">iPhone 390px Viewport</span>
            </div>
            <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Wireframe
            </span>
          </div>
        )}

        {/* DESKTOP SIDEBAR */}
        {!isMobileSim && (viewMode === "desktop" || viewMode === "auto") && (
          <aside className={`${viewMode === "desktop" ? "flex" : "hidden lg:flex"} w-60 bg-[#0c0c0e] border-r border-[#27272a] flex-col justify-between p-4 shrink-0`}>
            <div className="space-y-6">
              <div className="flex items-center gap-2.5 px-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg shadow-purple-500/20">
                  ⚡
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white leading-tight">Fitness Tracker</h2>
                  <p className="text-[10px] text-zinc-400">Desktop View</p>
                </div>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {[
                  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
                  { id: "workouts", label: "Workouts", icon: Dumbbell, hasBadge: true },
                  { id: "nutrition", label: "Nutrition", icon: Utensils },
                  { id: "progress", label: "Progress", icon: TrendingUp },
                  { id: "settings", label: "Settings", icon: Settings },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "dashboard") setActiveModule("module2");
                      if (item.id === "workouts") setActiveModule("module3");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      (activeModule === "module3" && item.id === "workouts") ||
                      (activeModule === "module2" && item.id === "dashboard")
                        ? "bg-violet-600/10 text-violet-400 border border-violet-500/30"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <item.icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </div>
                    {item.hasBadge && <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />}
                  </button>
                ))}
              </nav>
            </div>

            {/* Quick Session Stats Widget */}
            <div className="bg-[#141417] p-3 rounded-xl border border-[#27272a] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Gym Session</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {workoutStep === "active" ? "LIVE" : "STAGED"}
                </span>
              </div>
              <div className="text-sm font-bold text-white font-mono">{formatTime(sessionSeconds)}</div>
              <p className="text-[10px] text-zinc-400">Volume: {totalVolume.toLocaleString()} kg</p>
            </div>
          </aside>
        )}

        {/* WORKSPACE & CONTENT AREA */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] w-full overflow-hidden relative">
          {/* Toast Notification Pill */}
          {toastMessage && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-violet-600/95 text-white text-xs font-bold px-4 py-2 rounded-full shadow-2xl border border-violet-400/50 backdrop-blur-md flex items-center gap-2 animate-bounce">
              <Sparkles className="w-3.5 h-3.5 text-violet-200" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Header */}
          <header className="h-14 border-b border-[#27272a] px-3 sm:px-6 flex items-center justify-between bg-[#09090b]/90 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-purple-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                🏋️
              </div>
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {workoutStep === "staging"
                  ? "Today's Workout Plan & Weekly Split"
                  : "Active Gym Session"}
              </span>
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-2 shrink-0">
              {workoutStep === "staging" ? (
                <button
                  onClick={handleStartCustomizedSession}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-600/30 flex items-center gap-1.5 active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Start Workout</span>
                </button>
              ) : (
                <button
                  onClick={handleFinishWorkout}
                  className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-600/30 flex items-center gap-1.5 active:scale-95"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Finish Workout</span>
                </button>
              )}
            </div>
          </header>

          {/* MAIN CONTENT BODY */}
          <main ref={mainScrollRef} className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1">
            {/* ========================================================================= */}
            {/* FLOW STEP 1: PRE-WORKOUT STAGING & WEEKLY SPLIT SCHEDULE (USER REQUEST) */}
            {/* ========================================================================= */}
            {workoutStep === "staging" && (
              <div className="space-y-4 max-w-4xl mx-auto w-full">
                {/* 1. TODAY'S WORKOUT SETUP & CUSTOMIZATION CARD (CORE REQUIREMENT) */}
                <div className="bg-gradient-to-b from-[#18181f] to-[#141417] border-2 border-violet-500/50 rounded-3xl p-4 sm:p-5 shadow-2xl space-y-3.5">
                  <div className="flex flex-col gap-2 border-b border-zinc-800 pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                          Step 1: Set Today's Workout
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px]">
                        {selectedDayIndex === 1 ? "Today (Mon)" : activeDay.dayName}
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h2 className="text-sm sm:text-base font-black text-white leading-tight">
                        {selectedDayIndex === 1 ? "Today's Split:" : `${activeDay.dayName} Split:`}
                      </h2>

                      {/* Swap Split or Mark Rest Day */}
                      <select
                        value={isTodayRestDay ? "rest" : todayRoutineId}
                        onChange={(e) => {
                          if (e.target.value === "rest") {
                            handleSwitchTodaySplit(null);
                          } else {
                            handleSwitchTodaySplit(e.target.value);
                          }
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-zinc-900 border border-violet-500/50 text-xs font-bold text-violet-300 focus:outline-none cursor-pointer"
                      >
                        <option value="split-chest-tricep">Chest & Triceps (Hypertrophy)</option>
                        <option value="split-back-bicep">Back & Biceps (Pull Split)</option>
                        <option value="split-shoulders-abs">Shoulders & Abs (Delts Focus)</option>
                        <option value="split-legs-calves">Legs & Calves (Lower Overload)</option>
                        <option value="split-ppl-push">Push Day (Classic PPL)</option>
                        <option value="rest">🛋️ Mark as Rest Day</option>
                      </select>
                    </div>
                  </div>

                  {isTodayRestDay ? (
                    <div className="p-6 text-center space-y-2 bg-[#121215] rounded-2xl border border-zinc-800">
                      <div className="text-3xl">🛋️</div>
                      <h3 className="text-sm font-bold text-emerald-400">Marked as Rest Day (Active Recovery)</h3>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                        Rest and recovery allow muscle fibers to repair and grow stronger.
                      </p>
                      <button
                        onClick={() => handleSwitchTodaySplit("split-chest-tricep")}
                        className="px-4 py-1.5 rounded-xl bg-violet-600 text-white text-xs font-bold mt-2 hover:bg-violet-500 transition"
                      >
                        Switch to Workout Split
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* List of Exercises Planned for Today (Fully Editable & Clickable before starting) */}
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
                              key={ex.exerciseId + "-" + idx}
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
                                      {ex.muscle} · {ex.equipment}
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
                                    onClick={() => handleRemoveStagedExercise(idx)}
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
                                        onClick={() => handleUpdateStagedSets(idx, -1)}
                                        className="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs flex items-center justify-center active:scale-95"
                                      >
                                        -
                                      </button>
                                      <span className="text-xs font-black text-white font-mono min-w-[20px] text-center">
                                        {ex.targetSets}
                                      </span>
                                      <button
                                        onClick={() => handleUpdateStagedSets(idx, 1)}
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
                                        onClick={() => handleUpdateStagedWeight(idx, -2.5)}
                                        className="px-2 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold text-[10px] active:scale-95 whitespace-nowrap min-w-[30px] text-center"
                                      >
                                        -2.5
                                      </button>
                                      <span className="text-xs font-black text-violet-300 font-mono min-w-[34px] text-center">
                                        {ex.defaultWeight}kg
                                      </span>
                                      <button
                                        onClick={() => handleUpdateStagedWeight(idx, 2.5)}
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
                                        onClick={() => handleUpdateStagedReps(idx, repsOption)}
                                        className={`py-1 px-1 rounded-lg text-[10px] font-bold text-center transition active:scale-95 ${
                                          ex.targetReps === repsOption
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

                      {/* Primary Call to Action: Start Today's Session! */}
                      <button
                        onClick={handleStartCustomizedSession}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-violet-600/30 flex items-center justify-center gap-2 transition active:scale-98"
                      >
                        <Play className="w-4 h-4 fill-white" />
                        <span>Start Today's Workout Session ▶</span>
                      </button>
                    </>
                  )}
                </div>

                {/* 2. 7-DAY WEEKLY SPLIT SCHEDULE (MONDAY TO SUNDAY) */}
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
                        Click any day to re-assign routines (Monday = Chest & Triceps, Tuesday = Back & Biceps...)
                      </p>
                    </div>

                    <button
                      onClick={() => setIsWeeklyEditModalOpen(true)}
                      className="text-xs font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Plan</span>
                    </button>
                  </div>

                  {/* 7-Day Cards Grid (Swipeable Horizontal Strip on Mobile, Grid on Desktop) */}
                  <div
                    className={
                      isMobileSim
                        ? "flex overflow-x-auto gap-2.5 pb-2 snap-x scrollbar-thin scrollbar-thumb-zinc-800 -mx-1 px-1"
                        : "grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
                    }
                  >
                    {weeklySchedule.map((day) => {
                      const isToday = day.dayIndex === selectedDayIndex;
                      const hasWorkout = Boolean(day.routineId);

                      return (
                        <div
                          key={day.dayShort}
                          onClick={() => {
                            setSelectedDayIndex(day.dayIndex);
                            handleSwitchTodaySplit(day.routineId);
                          }}
                          className={`${
                            isMobileSim ? "w-[130px] shrink-0 snap-start" : ""
                          } p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 active:scale-98 ${
                            isToday
                              ? "bg-violet-950/40 border-violet-500 shadow-md shadow-violet-600/30 ring-1 ring-violet-500"
                              : "bg-[#18181b] border-[#27272a] hover:border-zinc-700"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold text-white">{day.dayShort}</span>
                            {isToday && (
                              <span className="px-1.5 py-0.5 rounded bg-violet-600 text-white font-bold text-[9px] uppercase">
                                Selected
                              </span>
                            )}
                          </div>

                          <div>
                            <div className="text-xs font-bold text-zinc-200 leading-snug line-clamp-2">
                              {day.routineId ? getRoutineName(day.routineId) : "🛋️ Rest Day"}
                            </div>
                            <span className="text-[10px] text-zinc-500 block mt-1">
                              {hasWorkout ? "Target Split" : "Recovery"}
                            </span>
                          </div>

                          <div className="pt-1.5 border-t border-zinc-800 text-[10px] text-violet-400 font-semibold flex items-center justify-between">
                            <span>{isToday ? "Viewing" : "Tap Day"}</span>
                            <ChevronRight className="w-3 h-3" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. ALL ROUTINE SPLITS LIBRARY */}
                <div className="bg-[#141417] border border-[#27272a] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                        Available Routine Splits ({routines.length})
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Create custom muscle pairings (e.g. Chest & Triceps, Back & Biceps)
                      </p>
                    </div>

                    <button
                      onClick={() => setIsRoutineBuilderOpen(true)}
                      className="px-2.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-600/30 flex items-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ New Split</span>
                    </button>
                  </div>

                  <div className={isMobileSim ? "grid grid-cols-1 gap-2.5" : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5"}>
                    {routines.map((r) => (
                      <div
                        key={r.id}
                        className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-violet-500/50 transition flex flex-col justify-between space-y-2"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="text-xs font-bold text-white truncate pr-2">{r.name}</h4>
                            <span className="text-[10px] font-semibold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full shrink-0">
                              {r.exercises.length} Ex
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 line-clamp-2">{r.description}</p>
                        </div>

                        <button
                          onClick={() => {
                            handleSwitchTodaySplit(r.id);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className="w-full py-1.5 rounded-xl bg-zinc-800 hover:bg-violet-600 hover:text-white text-xs font-bold text-zinc-300 transition"
                        >
                          Use for Today's Workout
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FLOW STEP 2: ACTIVE GYM LOGGING (LAUNCHED AFTER STAGING) */}
            {/* ========================================================================= */}
            {workoutStep === "active" && (
              <div className="space-y-4 max-w-4xl mx-auto w-full">
                {/* 1. SESSION TOP STATUS BAR */}
                <div className="bg-[#141417] border border-violet-500/40 rounded-2xl p-3.5 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Active Session
                        </span>
                      </div>
                      <h2 className="text-sm sm:text-base font-extrabold text-white">
                        {getRoutineName(todayRoutineId)}
                      </h2>
                    </div>

                    <button
                      onClick={() => setWorkoutStep("staging")}
                      className="px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold"
                    >
                      ← Back to Plan
                    </button>
                  </div>

                  {/* 3 Metrics: Time, Volume, Sets */}
                  <div className="grid grid-cols-3 divide-x divide-zinc-800 bg-[#18181b] border border-[#27272a] rounded-xl p-2 text-center">
                    <div>
                      <div className="text-[9px] text-zinc-400 uppercase font-semibold">Time</div>
                      <div className="text-xs sm:text-sm font-bold text-white font-mono">
                        {formatTime(sessionSeconds)}
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
                        {completedSets.length} / {allSets.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. 90-SECOND REST TIMER BAR */}
                <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-3 shadow-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Timer className={`w-3.5 h-3.5 ${isRestActive ? "text-violet-400 animate-pulse" : "text-zinc-500"}`} />
                      <span className="text-xs font-bold text-zinc-200">Rest Timer (90s)</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-violet-400">
                      {restSecondsRemaining !== null && restSecondsRemaining > 0
                        ? formatTime(restSecondsRemaining)
                        : "00:00"}
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-600 to-emerald-400 transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, Math.round(((90 - (restSecondsRemaining || 0)) / 90) * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-1 text-xs pt-0.5">
                    <button
                      onClick={() => setRestSecondsRemaining((prev) => Math.max(0, (prev || 0) - 30))}
                      className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-center border border-[#27272a] active:scale-95 transition"
                    >
                      -30s
                    </button>
                    <button
                      onClick={() => setRestSecondsRemaining((prev) => (prev || 0) + 30)}
                      className="flex-1 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-center border border-[#27272a] active:scale-95 transition"
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
                <div className="grid grid-cols-3 gap-1 bg-[#09090b] p-1 rounded-xl border border-[#27272a] w-full">
                  <button
                    onClick={() => setMobileLayout("spotlight")}
                    className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
                      mobileLayout === "spotlight"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>Spotlight</span>
                  </button>
                  <button
                    onClick={() => setMobileLayout("table")}
                    className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
                      mobileLayout === "table"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 shrink-0" />
                    <span>Table</span>
                  </button>
                  <button
                    onClick={() => setMobileLayout("stacked")}
                    className={`py-1.5 px-1 rounded-lg text-[11px] sm:text-xs font-bold transition flex items-center justify-center gap-1 ${
                      mobileLayout === "stacked"
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5 shrink-0" />
                    <span>Stacked</span>
                  </button>
                </div>

                {/* 4. ACTIVE EXERCISES LIST WITH STEPPERS */}
                <div className="space-y-3">
                  {stagedExercises.map((exercise, exIdx) => {
                    const firstUncompletedId = exercise.sets.find((s) => !s.isCompleted)?.id;

                    return (
                      <div
                        key={exercise.exerciseId + "-" + exIdx}
                        className="bg-[#141417] border border-[#27272a] rounded-2xl p-3 sm:p-4 shadow-lg space-y-3"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-[#27272a] pb-2 gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-7 h-7 rounded-xl bg-violet-500/10 text-violet-400 font-bold flex items-center justify-center text-xs">
                              🏋️
                            </span>
                            <div className="min-w-0">
                              <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                                {exercise.name}
                              </h3>
                              <p className="text-[10px] text-zinc-400">{exercise.muscle} · {exercise.equipment}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleAddSetToExercise(exIdx)}
                            className="py-1 px-2 rounded-lg bg-zinc-800 hover:bg-violet-900/40 hover:text-violet-300 text-[11px] font-semibold text-zinc-200 border border-[#27272a] flex items-center gap-1 transition shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Set</span>
                          </button>
                        </div>

                        {/* SPOTLIGHT MODE SETS */}
                        {mobileLayout === "spotlight" && (
                          <div className="space-y-2">
                            {exercise.sets.map((s) => {
                              const isSpotlight = s.id === firstUncompletedId;
                              const isDone = s.isCompleted;

                              if (isDone) {
                                return (
                                  <div
                                    key={s.id}
                                    className="p-2 px-3 rounded-xl bg-[#18181b]/70 border border-emerald-500/30 flex items-center justify-between"
                                  >
                                    <div className="flex items-center gap-2">
                                      <button onClick={() => handleCycleSetType(exIdx, s.id)}>
                                        {getSetTypeBadge(s.type, s.setNumber)}
                                      </button>
                                      <span className="text-xs font-bold text-zinc-300">Set {s.setNumber}:</span>
                                      <span className="text-xs font-mono font-bold text-emerald-400">
                                        {s.weight} kg × {s.reps} reps
                                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => handleToggleSet(exIdx, s.id)}
                                        className="text-[11px] text-zinc-500 hover:text-zinc-300 underline"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleToggleSet(exIdx, s.id)}
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
                                    className="p-3 rounded-2xl bg-gradient-to-b from-[#1c1c22] to-[#141417] border-2 border-violet-500 shadow-xl space-y-2.5 animate-fade-in"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <button onClick={() => handleCycleSetType(exIdx, s.id)}>
                                          {getSetTypeBadge(s.type, s.setNumber)}
                                        </button>
                                        <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                                          Current Active Set {s.setNumber}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Stepper Controls */}
                                    <div className="grid grid-cols-2 gap-2">
                                      {/* Weight */}
                                      <div className="bg-[#121215] p-2 rounded-xl border border-zinc-700 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                                          <span>Weight (kg)</span>
                                          <div className="flex gap-1">
                                            <button
                                              onClick={() => handleAdjustWeight(exIdx, s.id, -2.5)}
                                              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-bold"
                                            >
                                              -2.5
                                            </button>
                                            <button
                                              onClick={() => handleAdjustWeight(exIdx, s.id, 2.5)}
                                              className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-bold"
                                            >
                                              +2.5
                                            </button>
                                          </div>
                                        </div>
                                        <div className="flex items-center justify-between gap-1">
                                          <button
                                            onClick={() => handleAdjustWeight(exIdx, s.id, -1)}
                                            className="h-9 w-9 rounded-lg bg-zinc-800 text-white font-extrabold text-base border border-zinc-700"
                                          >
                                            -
                                          </button>
                                          <span className="text-lg font-black text-white font-mono flex-1 text-center">
                                            {s.weight}
                                          </span>
                                          <button
                                            onClick={() => handleAdjustWeight(exIdx, s.id, 1)}
                                            className="h-9 w-9 rounded-lg bg-zinc-800 text-white font-extrabold text-base border border-zinc-700"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>

                                      {/* Reps */}
                                      <div className="bg-[#121215] p-2 rounded-xl border border-zinc-700 space-y-1">
                                        <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                                          <span>Reps</span>
                                          <span className="text-[10px] text-violet-400 font-mono">count</span>
                                        </div>
                                        <div className="flex items-center justify-between gap-1">
                                          <button
                                            onClick={() => handleAdjustReps(exIdx, s.id, -1)}
                                            className="h-9 w-9 rounded-lg bg-zinc-800 text-white font-extrabold text-base border border-zinc-700"
                                          >
                                            -
                                          </button>
                                          <span className="text-lg font-black text-white font-mono flex-1 text-center">
                                            {s.reps}
                                          </span>
                                          <button
                                            onClick={() => handleAdjustReps(exIdx, s.id, 1)}
                                            className="h-9 w-9 rounded-lg bg-zinc-800 text-white font-extrabold text-base border border-zinc-700"
                                          >
                                            +
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Big Log Button */}
                                    <button
                                      onClick={() => handleToggleSet(exIdx, s.id)}
                                      className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition active:scale-98"
                                    >
                                      <CheckCircle2 className="w-4 h-4 fill-white stroke-violet-600" />
                                      <span>Log Set {s.setNumber} & Start Rest</span>
                                    </button>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={s.id}
                                  onClick={() => handleToggleSet(exIdx, s.id)}
                                  className="p-2 px-3 rounded-xl bg-[#141417] border border-[#27272a] flex items-center justify-between cursor-pointer opacity-60 hover:opacity-100 transition"
                                >
                                  <div className="flex items-center gap-2">
                                    {getSetTypeBadge(s.type, s.setNumber)}
                                    <span className="text-xs font-semibold text-zinc-400">
                                      Set {s.setNumber}: {s.weight} kg × {s.reps} reps
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-zinc-500 font-medium">Tap to focus</span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* TABLE MODE SETS (Minimalist Hevy Style) */}
                        {mobileLayout === "table" && (
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-[36px_1fr_60px_52px_36px] items-center gap-1.5 px-2 text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                              <div className="text-center">Set</div>
                              <div>Prev</div>
                              <div className="text-center">Kg</div>
                              <div className="text-center">Reps</div>
                              <div className="text-center">Log</div>
                            </div>

                            {exercise.sets.map((s) => (
                              <div
                                key={s.id}
                                className={`grid grid-cols-[36px_1fr_60px_52px_36px] items-center gap-1.5 p-2 rounded-xl border transition ${
                                  s.isCompleted
                                    ? "bg-[#18181b]/90 border-emerald-500/40"
                                    : "bg-[#18181b] border-[#27272a] hover:border-zinc-700"
                                }`}
                              >
                                <div className="flex items-center justify-center">
                                  <button onClick={() => handleCycleSetType(exIdx, s.id)}>
                                    {getSetTypeBadge(s.type, s.setNumber)}
                                  </button>
                                </div>

                                <div className="text-[11px] font-mono text-zinc-400 truncate">
                                  {s.prevBest || "—"}
                                </div>

                                <div className="flex items-center justify-center">
                                  <input
                                    type="number"
                                    step="0.5"
                                    value={s.weight}
                                    onChange={(e) => {
                                      const val = parseFloat(e.target.value) || 0;
                                      setStagedExercises((prev) => {
                                        const clone = JSON.parse(JSON.stringify(prev));
                                        clone[exIdx].sets = clone[exIdx].sets.map((item: any) =>
                                          item.id === s.id ? { ...item, weight: val } : item
                                        );
                                        return clone;
                                      });
                                    }}
                                    className="w-14 h-8 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div className="flex items-center justify-center">
                                  <input
                                    type="number"
                                    value={s.reps}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setStagedExercises((prev) => {
                                        const clone = JSON.parse(JSON.stringify(prev));
                                        clone[exIdx].sets = clone[exIdx].sets.map((item: any) =>
                                          item.id === s.id ? { ...item, reps: val } : item
                                        );
                                        return clone;
                                      });
                                    }}
                                    className="w-12 h-8 text-center bg-zinc-900 border border-zinc-700 rounded-lg text-xs font-bold text-white font-mono focus:outline-none focus:border-violet-500"
                                  />
                                </div>

                                <div className="flex items-center justify-center">
                                  <button
                                    onClick={() => handleToggleSet(exIdx, s.id)}
                                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition active:scale-95 ${
                                      s.isCompleted
                                        ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                                    }`}
                                  >
                                    {s.isCompleted ? (
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

                        {/* STACKED CARDS MODE (50/50 Touch Friendly) */}
                        {mobileLayout === "stacked" && (
                          <div className="space-y-2">
                            {exercise.sets.map((s) => (
                              <div
                                key={s.id}
                                className={`p-2.5 sm:p-3 rounded-2xl border transition-all ${
                                  s.isCompleted
                                    ? "bg-[#18181b]/90 border-emerald-500/40 shadow-sm"
                                    : "bg-[#141417] border-[#27272a] hover:border-violet-500/40"
                                }`}
                              >
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <button onClick={() => handleCycleSetType(exIdx, s.id)}>
                                      {getSetTypeBadge(s.type, s.setNumber)}
                                    </button>
                                    <span className="text-xs font-bold text-white">
                                      Set {s.setNumber}
                                    </span>
                                    {s.prevBest && (
                                      <span className="text-[10px] text-zinc-500 font-mono">
                                        (Prev: {s.prevBest})
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    onClick={() => handleToggleSet(exIdx, s.id)}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ${
                                      s.isCompleted
                                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                        : "bg-zinc-800 hover:bg-violet-600 text-zinc-300 hover:text-white"
                                    }`}
                                  >
                                    {s.isCompleted ? (
                                      <>
                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                        <span>Done</span>
                                      </>
                                    ) : (
                                      <>
                                        <Circle className="w-3.5 h-3.5" />
                                        <span>Complete</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                {/* 50/50 Stepper Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                  {/* Weight Stepper */}
                                  <div className="bg-[#121215] p-2 rounded-xl border border-zinc-700/80 space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                                      <span>Weight (kg)</span>
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => handleAdjustWeight(exIdx, s.id, -2.5)}
                                          className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-bold active:scale-95"
                                        >
                                          -2.5
                                        </button>
                                        <button
                                          onClick={() => handleAdjustWeight(exIdx, s.id, 2.5)}
                                          className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[9px] font-bold active:scale-95"
                                        >
                                          +2.5
                                        </button>
                                      </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                      <button
                                        onClick={() => handleAdjustWeight(exIdx, s.id, -1)}
                                        className="h-8 w-8 rounded-lg bg-zinc-800 text-white font-extrabold text-sm border border-zinc-700 active:scale-95"
                                      >
                                        -
                                      </button>
                                      <span className="text-base font-black text-white font-mono flex-1 text-center">
                                        {s.weight}
                                      </span>
                                      <button
                                        onClick={() => handleAdjustWeight(exIdx, s.id, 1)}
                                        className="h-8 w-8 rounded-lg bg-zinc-800 text-white font-extrabold text-sm border border-zinc-700 active:scale-95"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </div>

                                  {/* Reps Stepper */}
                                  <div className="bg-[#121215] p-2 rounded-xl border border-zinc-700/80 space-y-1">
                                    <div className="flex items-center justify-between text-[10px] font-bold uppercase text-zinc-400">
                                      <span>Reps</span>
                                      <span className="text-[10px] text-violet-400 font-mono">count</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-1">
                                      <button
                                        onClick={() => handleAdjustReps(exIdx, s.id, -1)}
                                        className="h-8 w-8 rounded-lg bg-zinc-800 text-white font-extrabold text-sm border border-zinc-700 active:scale-95"
                                      >
                                        -
                                      </button>
                                      <span className="text-base font-black text-white font-mono flex-1 text-center">
                                        {s.reps}
                                      </span>
                                      <button
                                        onClick={() => handleAdjustReps(exIdx, s.id, 1)}
                                        className="h-8 w-8 rounded-lg bg-zinc-800 text-white font-extrabold text-sm border border-zinc-700 active:scale-95"
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
                  })}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* FLOW STEP 3: WORKOUT FINISHED SUMMARY */}
            {/* ========================================================================= */}
            {workoutStep === "summary" && (
              <div className="space-y-4 max-w-md mx-auto w-full text-center py-6 animate-scale-in">
                <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-3xl mx-auto border border-emerald-500/30">
                  🎉
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">Workout Completed!</h2>
                <p className="text-xs text-zinc-400">
                  Great session today! Your volume and sets have been logged to your fitness record.
                </p>

                <div className="grid grid-cols-3 gap-2 bg-[#18181b] p-3 rounded-2xl border border-zinc-800 text-xs my-4">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Total Time</span>
                    <span className="font-extrabold text-white font-mono">{formatTime(sessionSeconds)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Volume</span>
                    <span className="font-extrabold text-violet-400 font-mono">
                      {totalVolume.toLocaleString()} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase block">Sets Done</span>
                    <span className="font-extrabold text-emerald-400 font-mono">
                      {completedSets.length} sets
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setWorkoutStep("staging")}
                  className="w-full py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30"
                >
                  Return to Workout Plan
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODAL: ADD EXERCISE TO TODAY'S PLAN */}
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
                <input
                  type="text"
                  placeholder="Search exercise by name or muscle..."
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500"
                />

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
                      onClick={() => handleAddExerciseToStaging(ex.id)}
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

      {/* MODAL: EDIT FULL 7-DAY WEEKLY SCHEDULE */}
      {isWeeklyEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[88vh]">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Edit 7-Day Weekly Training Split</h3>
                <p className="text-[11px] text-zinc-400">Assign what routines you do Monday through Sunday</p>
              </div>
              <button
                onClick={() => setIsWeeklyEditModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 max-h-80">
              {weeklySchedule.map((day) => (
                <div
                  key={day.dayName}
                  className="p-2.5 rounded-xl bg-[#18181b] border border-[#27272a] flex items-center justify-between gap-3"
                >
                  <span className="text-xs font-extrabold text-white w-20">{day.dayName}</span>

                  <select
                    value={day.routineId || "rest"}
                    onChange={(e) =>
                      handleUpdateDaySchedule(
                        day.dayIndex,
                        e.target.value === "rest" ? null : e.target.value
                      )
                    }
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-xs font-bold text-violet-300 focus:outline-none"
                  >
                    <option value="split-chest-tricep">Chest & Triceps (Hypertrophy)</option>
                    <option value="split-back-bicep">Back & Biceps (Pull Split)</option>
                    <option value="split-shoulders-abs">Shoulders & Abs (Delts Focus)</option>
                    <option value="split-legs-calves">Legs & Calves (Lower Overload)</option>
                    <option value="split-ppl-push">Push Day (Classic PPL)</option>
                    <option value="rest">🛋️ Rest Day (Active Recovery)</option>
                  </select>
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-[#27272a] bg-[#141417] flex justify-end">
              <button
                onClick={() => setIsWeeklyEditModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold shadow-md shadow-violet-600/30"
              >
                Save Weekly Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
