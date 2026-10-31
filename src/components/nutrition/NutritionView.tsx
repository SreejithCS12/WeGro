"use client";

import { useState } from "react";
import { Utensils, Search, Plus, Sparkles, PieChart } from "lucide-react";
import { Food, FoodLog, FitnessGoal } from "@/types/database";
import { formatCalories } from "@/lib/utils";

interface NutritionViewProps {
  foods: Food[];
  foodLogs: FoodLog[];
  goal: FitnessGoal;
  onOpenAddFoodModal: () => void;
}

export function NutritionView({
  foods,
  foodLogs,
  goal,
  onOpenAddFoodModal,
}: NutritionViewProps) {
  const [searchFood, setSearchFood] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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

  const categories = [
    "All",
    "Grains",
    "Chicken & Meat",
    "Eggs",
    "Dairy",
    "Vegetarian Protein",
    "Legumes",
    "Fruits",
    "Vegetables",
    "Nuts",
    "Custom",
  ];

  const filteredFoods = foods.filter((f) => {
    const matchesCat = selectedCategory === "All" || f.category === selectedCategory;
    const matchesQuery =
      f.name.toLowerCase().includes(searchFood.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchFood.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-5 pb-20">
      {/* Nutrition Macro Distribution Card */}
      <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <PieChart className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Macronutrient Energy Ratio
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-zinc-200">
            {formatCalories(totalCalories)} / {formatCalories(goal.calorie_target)} kcal
          </span>
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
            <span className="text-[10px] text-rose-400 font-semibold block">Protein (4 kcal/g)</span>
            <span className="text-sm font-bold text-white font-mono">{Math.round(totalProtein)}g</span>
            <span className="text-[10px] text-zinc-500 block font-mono">{proteinEnergyPct}% energy</span>
          </div>

          <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a]">
            <span className="text-[10px] text-amber-400 font-semibold block">Carbs (4 kcal/g)</span>
            <span className="text-sm font-bold text-white font-mono">{Math.round(totalCarbs)}g</span>
            <span className="text-[10px] text-zinc-500 block font-mono">{carbsEnergyPct}% energy</span>
          </div>

          <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a]">
            <span className="text-[10px] text-emerald-400 font-semibold block">Fat (9 kcal/g)</span>
            <span className="text-sm font-bold text-white font-mono">{Math.round(totalFat)}g</span>
            <span className="text-[10px] text-zinc-500 block font-mono">{fatEnergyPct}% energy</span>
          </div>
        </div>
      </div>

      {/* Food Library Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
              Food Library ({foods.length})
            </h3>
            <p className="text-[11px] text-zinc-400">Search ingredients or create custom foods</p>
          </div>

          <button
            onClick={onOpenAddFoodModal}
            className="py-1.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Food</span>
          </button>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`py-1 px-3 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "bg-[#141417] border border-[#27272a] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
          <input
            type="text"
            placeholder="Search food by name or category..."
            value={searchFood}
            onChange={(e) => setSearchFood(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-[#141417] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white placeholder-zinc-500 outline-none"
          />
        </div>

        {/* Food Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredFoods.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-[#141417] border border-[#27272a] hover:border-zinc-700 transition-colors flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.name}</span>
                  {item.category && (
                    <span className="text-[9px] font-semibold text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Serving: {item.serving_description} · P: {item.protein}g · C: {item.carbohydrates}g · F:{" "}
                  {item.fat}g
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-zinc-100 font-mono">
                  {item.calories} kcal
                </span>
              </div>
            </div>
          ))}

          {filteredFoods.length === 0 && (
            <div className="col-span-full p-8 text-center bg-[#141417] border border-[#27272a] rounded-2xl space-y-1">
              <p className="text-xs font-semibold text-zinc-300">No foods found</p>
              <p className="text-[11px] text-zinc-500">
                Try adjusting your search query or category filter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
