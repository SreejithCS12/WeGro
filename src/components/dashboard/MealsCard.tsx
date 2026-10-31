"use client";

import { Plus, Trash2, ChevronDown, Utensils, Copy } from "lucide-react";
import { FoodLog, MealCategory } from "@/types/database";
import { formatCalories } from "@/lib/utils";

interface MealsCardProps {
  foodLogs: FoodLog[];
  onAddFood: (category: MealCategory) => void;
  onDeleteFood: (id: string) => void;
  onOpenCopyModal?: () => void;
}

export function MealsCard({
  foodLogs,
  onAddFood,
  onDeleteFood,
  onOpenCopyModal,
}: MealsCardProps) {
  const categories: { id: MealCategory; label: string; icon: string }[] = [
    { id: "breakfast", label: "Breakfast", icon: "🍳" },
    { id: "lunch", label: "Lunch", icon: "🥗" },
    { id: "dinner", label: "Dinner", icon: "🍛" },
    { id: "snacks", label: "Snacks", icon: "🍎" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Utensils className="w-4 h-4 text-violet-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Meals & Food Logs
          </h3>
        </div>

        {onOpenCopyModal && (
          <button
            onClick={onOpenCopyModal}
            className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 bg-violet-950/30 border border-violet-500/30 px-2.5 py-1 rounded-lg transition flex items-center gap-1 active:scale-95"
          >
            <Copy className="w-3 h-3" />
            <span>Copy from Yesterday</span>
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {categories.map((cat) => {
          const categoryLogs = foodLogs.filter((f) => f.meal_category === cat.id);
          const categoryCalories = categoryLogs.reduce((acc, f) => acc + f.calories, 0);

          return (
            <div
              key={cat.id}
              className="bg-[#141417] border border-[#27272a] rounded-2xl p-3.5 shadow-md"
            >
              {/* Category Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base">{cat.icon}</span>
                  <div>
                    <h4 className="text-sm font-bold text-white">{cat.label}</h4>
                    <p className="text-[11px] font-mono text-zinc-400">
                      {formatCalories(categoryCalories)} kcal
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onAddFood(cat.id)}
                  className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-violet-900/40 hover:text-violet-300 text-xs font-semibold text-zinc-300 transition-colors flex items-center gap-1 border border-[#27272a]"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {/* Items List */}
              {categoryLogs.length > 0 ? (
                <div className="space-y-1.5 pt-1.5 border-t border-[#27272a]/60">
                  {categoryLogs.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 px-2 rounded-xl bg-[#18181b] hover:bg-zinc-800/60 transition-colors group"
                    >
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="text-xs font-semibold text-zinc-200 truncate">
                          {item.food_name_snapshot}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-mono">
                          {item.quantity} {item.unit} · P: {Math.round(item.protein)}g · C:{" "}
                          {Math.round(item.carbohydrates)}g · F: {Math.round(item.fat)}g
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          {formatCalories(item.calories)} kcal
                        </span>
                        <button
                          onClick={() => onDeleteFood(item.id)}
                          className="text-zinc-500 hover:text-red-400 p-1 rounded-md opacity-60 group-hover:opacity-100 transition-opacity"
                          title="Delete entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-zinc-500 italic pt-1">No items logged yet</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
