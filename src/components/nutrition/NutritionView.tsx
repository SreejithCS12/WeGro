"use client";

import { PieChart, Plus, Zap } from "lucide-react";
import { Food, FoodLog, FitnessGoal } from "@/types/database";
import { formatCalories } from "@/lib/utils";

interface NutritionViewProps {
  foods?: Food[];
  foodLogs: FoodLog[];
  goal: FitnessGoal;
  onOpenAddFoodModal?: () => void;
  onOpenQuickAdd?: () => void;
}

export function NutritionView({
  foodLogs,
  goal,
  onOpenAddFoodModal,
  onOpenQuickAdd,
}: NutritionViewProps) {
  const totalCalories = foodLogs.reduce((acc, f) => acc + f.calories, 0);
  const totalProtein = foodLogs.reduce((acc, f) => acc + f.protein, 0);
  const totalCarbs = foodLogs.reduce((acc, f) => acc + f.carbohydrates, 0);
  const totalFat = foodLogs.reduce((acc, f) => acc + f.fat, 0);

  // Macro Energy percentages
  const proteinKcal = totalProtein * 4;
  const carbsKcal = totalCarbs * 4;
  const fatKcal = totalFat * 9;
  const macroKcalTotal = proteinKcal + carbsKcal + fatKcal || 1;

  const proteinEnergyPct = Math.round((proteinKcal / macroKcalTotal) * 100);
  const carbsEnergyPct = Math.round((carbsKcal / macroKcalTotal) * 100);
  const fatEnergyPct = Math.round((fatKcal / macroKcalTotal) * 100);

  return (
    <div className="space-y-5 pb-20">
      {/* Nutrition Macro Distribution Card */}
      <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Macronutrient Energy Ratio
              </h3>
              <p className="text-[11px] font-mono text-zinc-400 mt-0.5 sm:hidden">
                <span className="text-zinc-200 font-semibold">{formatCalories(totalCalories)}</span> / {formatCalories(goal.calorie_target)} kcal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="hidden sm:inline text-xs font-mono font-medium text-zinc-400 mr-1 shrink-0 whitespace-nowrap">
              <span className="text-zinc-200 font-bold">{formatCalories(totalCalories)}</span> / {formatCalories(goal.calorie_target)} kcal
            </span>
            {onOpenQuickAdd && (
              <button
                onClick={onOpenQuickAdd}
                className="flex-1 sm:flex-initial py-1.5 sm:py-1 px-3 sm:px-2.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-95 whitespace-nowrap"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Quick Add</span>
              </button>
            )}
            {onOpenAddFoodModal && (
              <button
                onClick={onOpenAddFoodModal}
                className="flex-1 sm:flex-initial py-1.5 sm:py-1 px-3 sm:px-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-violet-600/30 transition-all active:scale-95 whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Food</span>
              </button>
            )}
          </div>
        </div>

        {/* Stacked Macro Bar */}
        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-rose-500 transition-all duration-300"
            style={{ width: `${proteinEnergyPct}%` }}
            title={`Protein: ${proteinEnergyPct}%`}
          />
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${carbsEnergyPct}%` }}
            title={`Carbs: ${carbsEnergyPct}%`}
          />
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${fatEnergyPct}%` }}
            title={`Fat: ${fatEnergyPct}%`}
          />
        </div>

        {/* Macro Legends */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a]">
            <span className="text-[10px] text-rose-400 font-semibold block leading-tight">
              Protein <span className="text-[9px] text-rose-400/80">(4 kcal/g)</span>
            </span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">{Math.round(totalProtein)}g</span>
            <span className="text-[10px] text-zinc-500 block font-mono">{proteinEnergyPct}% energy</span>
          </div>

          <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a]">
            <span className="text-[10px] text-amber-400 font-semibold block leading-tight">
              Carbs <span className="text-[9px] text-amber-400/80">(4 kcal/g)</span>
            </span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">{Math.round(totalCarbs)}g</span>
            <span className="text-[10px] text-zinc-500 block font-mono">{carbsEnergyPct}% energy</span>
          </div>

          <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a]">
            <span className="text-[10px] text-emerald-400 font-semibold block leading-tight">
              Fat <span className="text-[9px] text-emerald-400/80">(9 kcal/g)</span>
            </span>
            <span className="text-sm font-bold text-white font-mono mt-0.5 block">{Math.round(totalFat)}g</span>
            <span className="text-[10px] text-zinc-500 block font-mono">{fatEnergyPct}% energy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
