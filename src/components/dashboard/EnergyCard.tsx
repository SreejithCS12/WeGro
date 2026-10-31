"use client";

import { Flame } from "lucide-react";
import { formatCalories } from "@/lib/utils";

interface EnergyCardProps {
  calorieTarget: number;
  caloriesConsumed: number;
  proteinTarget: number;
  proteinConsumed: number;
  carbsTarget: number;
  carbsConsumed: number;
  fatTarget: number;
  fatConsumed: number;
}

export function EnergyCard({
  calorieTarget,
  caloriesConsumed,
  proteinTarget,
  proteinConsumed,
  carbsTarget,
  carbsConsumed,
  fatTarget,
  fatConsumed,
}: EnergyCardProps) {
  const caloriesRemaining = calorieTarget - caloriesConsumed;
  const isOver = caloriesRemaining < 0;
  const percentage = Math.min(100, Math.round((caloriesConsumed / calorieTarget) * 100)) || 0;

  const proteinPct = Math.min(100, Math.round((proteinConsumed / proteinTarget) * 100)) || 0;
  const carbsPct = Math.min(100, Math.round((carbsConsumed / carbsTarget) * 100)) || 0;
  const fatPct = Math.min(100, Math.round((fatConsumed / fatTarget) * 100)) || 0;

  return (
    <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg relative overflow-hidden">
      {/* Background glow accent */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Flame className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Daily Calories
          </span>
        </div>
        <span className="text-xs font-medium text-zinc-400">
          Target: <strong className="text-zinc-200">{formatCalories(calorieTarget)}</strong> kcal
        </span>
      </div>

      {/* Main Calorie Numbers */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-3xl font-extrabold tracking-tight text-white font-mono">
            {formatCalories(caloriesConsumed)}
          </span>
          <span className="text-sm font-medium text-zinc-400 ml-1.5">kcal consumed</span>
        </div>
        <div className="text-right">
          <span
            className={`text-sm font-bold font-mono ${
              isOver ? "text-red-400" : "text-violet-400"
            }`}
          >
            {isOver
              ? `+${formatCalories(Math.abs(caloriesRemaining))} over`
              : `${formatCalories(caloriesRemaining)} left`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver
              ? "bg-gradient-to-r from-red-500 to-orange-500"
              : "bg-gradient-to-r from-violet-600 to-purple-400 shadow-[0_0_12px_var(--theme-glow,rgba(139,92,246,0.6))]"
          }`}
          style={{ width: `${Math.min(100, (caloriesConsumed / calorieTarget) * 100)}%` }}
        />
      </div>

      {/* Macronutrient Breakdowns */}
      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#27272a]">
        {/* Protein */}
        <div className="bg-[#18181b] p-2.5 rounded-xl border border-[#27272a]/60">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-rose-400 flex items-center gap-1">
              🥩 Protein
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">{proteinPct}%</span>
          </div>
          <div className="text-xs font-bold text-zinc-100 font-mono">
            {Math.round(proteinConsumed)}
            <span className="text-[10px] text-zinc-400 font-normal"> / {proteinTarget}g</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-rose-500 rounded-full transition-all duration-300"
              style={{ width: `${proteinPct}%` }}
            />
          </div>
        </div>

        {/* Carbohydrates */}
        <div className="bg-[#18181b] p-2.5 rounded-xl border border-[#27272a]/60">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-amber-400 flex items-center gap-1">
              🍚 Carbs
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">{carbsPct}%</span>
          </div>
          <div className="text-xs font-bold text-zinc-100 font-mono">
            {Math.round(carbsConsumed)}
            <span className="text-[10px] text-zinc-400 font-normal"> / {carbsTarget}g</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{ width: `${carbsPct}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="bg-[#18181b] p-2.5 rounded-xl border border-[#27272a]/60">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              🥑 Fat
            </span>
            <span className="text-zinc-400 font-mono text-[10px]">{fatPct}%</span>
          </div>
          <div className="text-xs font-bold text-zinc-100 font-mono">
            {Math.round(fatConsumed)}
            <span className="text-[10px] text-zinc-400 font-normal"> / {fatTarget}g</span>
          </div>
          <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mt-1.5">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${fatPct}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
