"use client";

import { Plus, Droplets, Dumbbell, Scale } from "lucide-react";

interface QuickActionsProps {
  onAddFood: () => void;
  onAddWater: () => void;
  onStartWorkout: () => void;
  onLogWeight: () => void;
}

export function QuickActions({
  onAddFood,
  onAddWater,
  onStartWorkout,
  onLogWeight,
}: QuickActionsProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {/* Add Food */}
      <button
        onClick={onAddFood}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#141417] border border-[#27272a] hover:border-purple-500/50 hover:bg-zinc-900 active:scale-95 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
          <Plus className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-zinc-300">Food</span>
      </button>

      {/* Add Water */}
      <button
        onClick={onAddWater}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#141417] border border-[#27272a] hover:border-sky-500/50 hover:bg-zinc-900 active:scale-95 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-400 group-hover:bg-sky-500 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
          <Droplets className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-zinc-300">Water</span>
      </button>

      {/* Start Workout */}
      <button
        onClick={onStartWorkout}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-violet-950/40 to-[#141417] border border-violet-500/30 hover:border-violet-500 hover:bg-violet-900/20 active:scale-95 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-violet-600 text-white flex items-center justify-center mb-1.5 shadow-md shadow-violet-600/30">
          <Dumbbell className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-violet-300">Workout</span>
      </button>

      {/* Log Weight */}
      <button
        onClick={onLogWeight}
        className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#141417] border border-[#27272a] hover:border-zinc-500 hover:bg-zinc-900 active:scale-95 transition-all group"
      >
        <div className="w-9 h-9 rounded-xl bg-zinc-800 text-zinc-300 group-hover:bg-zinc-700 group-hover:text-white flex items-center justify-center mb-1.5 transition-colors">
          <Scale className="w-5 h-5" />
        </div>
        <span className="text-[11px] font-semibold text-zinc-300">Weight</span>
      </button>
    </div>
  );
}
