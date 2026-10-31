"use client";

import { useState } from "react";
import {
  X,
  Search,
  Plus,
  Trash2,
  Dumbbell,
  Layers,
  Play,
  Check,
  ChevronDown,
} from "lucide-react";
import { Exercise, WorkoutRoutine, RoutineExercise } from "@/types/database";

interface CreateRoutineModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: Exercise[];
  onCreateRoutine: (
    routine: {
      name: string;
      description?: string;
      exercises: Array<Omit<RoutineExercise, "id" | "routine_id" | "created_at">>;
    },
    autoStart?: boolean
  ) => void;
}

interface SelectedExerciseConfig {
  exercise: Exercise;
  targetSets: number;
  targetReps: string;
  targetWeightKg: number;
  restSeconds: number;
}

export function CreateRoutineModal({
  isOpen,
  onClose,
  exercises,
  onCreateRoutine,
}: CreateRoutineModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMuscle, setSelectedMuscle] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedList, setSelectedList] = useState<SelectedExerciseConfig[]>([]);

  if (!isOpen) return null;

  const muscleGroups = ["All", "Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];

  const filteredExercises = exercises.filter((ex) => {
    const matchesMuscle = selectedMuscle === "All" || ex.muscle_group === selectedMuscle;
    const matchesSearch =
      ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.equipment.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMuscle && matchesSearch;
  });

  const handleToggleAddExercise = (exercise: Exercise) => {
    const exists = selectedList.some((item) => item.exercise.id === exercise.id);
    if (exists) {
      setSelectedList((prev) => prev.filter((item) => item.exercise.id !== exercise.id));
    } else {
      setSelectedList((prev) => [
        ...prev,
        {
          exercise,
          targetSets: 3,
          targetReps: "8-12",
          targetWeightKg: 20,
          restSeconds: 90,
        },
      ]);
    }
  };

  const handleUpdateConfig = (
    index: number,
    field: keyof SelectedExerciseConfig,
    value: string | number
  ) => {
    setSelectedList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveItem = (index: number) => {
    setSelectedList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (autoStart = false) => {
    if (!name.trim()) {
      alert("Please enter a routine name (e.g. Chest & Triceps, Back & Biceps).");
      return;
    }
    if (selectedList.length === 0) {
      alert("Please select at least 1 exercise for this routine split.");
      return;
    }

    const routineExercises = selectedList.map((item, idx) => ({
      exercise_id: item.exercise.id,
      order_index: idx,
      target_sets: item.targetSets,
      target_reps: item.targetReps,
      target_weight_kg: item.targetWeightKg,
      rest_seconds: item.restSeconds,
    }));

    onCreateRoutine(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        exercises: routineExercises,
      },
      autoStart
    );

    // Reset and close
    setName("");
    setDescription("");
    setSelectedList([]);
    onClose();
  };

  // Quick preset title recommendations
  const presets = [
    "Chest & Triceps (Hypertrophy)",
    "Back & Biceps (Pull Split)",
    "Shoulders & Abs (Delts Focus)",
    "Legs & Calves (Lower Overload)",
    "Chest on Monday",
    "Back & Biceps Tuesday",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-2xl flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[92vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/10 text-violet-400 font-bold flex items-center justify-center text-sm border border-violet-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Custom Routine Split</h3>
              <p className="text-[11px] text-zinc-400">
                Design custom day splits (Chest & Triceps, Back & Biceps, etc.)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {/* 1. Name & Quick Presets */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-300 block">
              Routine Split Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chest & Triceps, Back & Biceps"
              className="w-full px-3 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-violet-500"
            />

            {/* Quick preset pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setName(preset)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 text-[10px] font-semibold shrink-0 transition"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Optional Description */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 block mb-1">
              Description / Target Notes
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Primary compound hypertrophy followed by arm isolation"
              className="w-full px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white focus:outline-none focus:border-violet-500"
            />
          </div>

          {/* 3. Selected Exercises in Routine */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Exercises in Routine ({selectedList.length})
              </span>
              <span className="text-[10px] text-zinc-400">
                Set targets for each exercise
              </span>
            </div>

            {selectedList.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-[#27272a] text-center text-xs text-zinc-500">
                No exercises selected yet. Choose from the catalog below.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {selectedList.map((item, idx) => (
                  <div
                    key={item.exercise.id}
                    className="p-3 rounded-xl bg-[#18181b] border border-[#27272a] space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-violet-600/20 text-violet-400 font-bold text-[10px] flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-white">{item.exercise.name}</h4>
                          <span className="text-[10px] text-zinc-500 font-medium">
                            {item.exercise.muscle_group} · {item.exercise.equipment}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-zinc-500 hover:text-red-400 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Target Controls: Sets, Reps, Weight */}
                    <div className="grid grid-cols-3 gap-2 pt-1 border-t border-zinc-800 text-xs">
                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                          Target Sets
                        </span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={item.targetSets}
                          onChange={(e) =>
                            handleUpdateConfig(idx, "targetSets", parseInt(e.target.value) || 1)
                          }
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-center font-bold text-white font-mono"
                        />
                      </div>

                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                          Target Reps
                        </span>
                        <input
                          type="text"
                          value={item.targetReps}
                          onChange={(e) =>
                            handleUpdateConfig(idx, "targetReps", e.target.value)
                          }
                          placeholder="e.g. 8-10"
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-center font-bold text-white font-mono"
                        />
                      </div>

                      <div>
                        <span className="text-[9px] text-zinc-400 uppercase font-semibold block mb-0.5">
                          Target Kg
                        </span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={item.targetWeightKg}
                          onChange={(e) =>
                            handleUpdateConfig(
                              idx,
                              "targetWeightKg",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1 bg-zinc-900 border border-zinc-700 rounded-lg text-center font-bold text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 4. Exercise Catalog Picker */}
          <div className="space-y-2 pt-2 border-t border-[#27272a]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Select from Exercise Library
              </span>
              <span className="text-[10px] text-zinc-400">
                {filteredExercises.length} matches
              </span>
            </div>

            {/* Muscle Group Filters */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
              {muscleGroups.map((muscle) => (
                <button
                  key={muscle}
                  type="button"
                  onClick={() => setSelectedMuscle(muscle)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                    selectedMuscle === muscle
                      ? "bg-violet-600 text-white shadow-sm"
                      : "bg-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {muscle}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercise name or equipment..."
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-900 border border-zinc-700 rounded-xl text-xs text-white focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Exercises Grid */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {filteredExercises.map((ex) => {
                const isSelected = selectedList.some((item) => item.exercise.id === ex.id);
                return (
                  <div
                    key={ex.id}
                    onClick={() => handleToggleAddExercise(ex)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition active:scale-98 ${
                      isSelected
                        ? "bg-violet-950/30 border-violet-500/60 text-white"
                        : "bg-[#18181b] border-[#27272a] hover:border-zinc-700 text-zinc-300"
                    }`}
                  >
                    <div>
                      <h5 className="text-xs font-bold text-white">{ex.name}</h5>
                      <span className="text-[10px] text-zinc-400">
                        {ex.muscle_group} · {ex.equipment}
                      </span>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs transition ${
                        isSelected
                          ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 sm:p-4 border-t border-[#27272a] bg-[#141417] flex items-center justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition border border-[#27272a]"
          >
            Save Routine
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold transition shadow-md shadow-violet-600/30 flex items-center gap-1.5 active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-white" />
            <span>Save & Start Workout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
