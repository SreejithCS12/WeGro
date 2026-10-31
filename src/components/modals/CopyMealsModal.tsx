"use client";

import { useState } from "react";
import { X, Copy, Check, Utensils } from "lucide-react";
import { FoodLog, MealCategory } from "@/types/database";
import { formatCalories } from "@/lib/utils";

interface CopyMealsModalProps {
  isOpen: boolean;
  onClose: () => void;
  yesterdayLogs: FoodLog[];
  yesterdayDate: string;
  onCopy: (categories: MealCategory[]) => void;
}

export function CopyMealsModal({
  isOpen,
  onClose,
  yesterdayLogs,
  yesterdayDate,
  onCopy,
}: CopyMealsModalProps) {
  const categories: { id: MealCategory; label: string; icon: string }[] = [
    { id: "breakfast", label: "Breakfast", icon: "🍳" },
    { id: "lunch", label: "Lunch", icon: "🥗" },
    { id: "dinner", label: "Dinner", icon: "🍛" },
    { id: "snacks", label: "Snacks", icon: "🍎" },
  ];

  // Selected categories state
  const [selectedCats, setSelectedCats] = useState<Record<MealCategory, boolean>>({
    breakfast: true,
    lunch: true,
    dinner: true,
    snacks: true,
  });

  if (!isOpen) return null;

  const toggleCategory = (cat: MealCategory) => {
    setSelectedCats((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const handleCopy = () => {
    const catsToCopy = categories
      .filter((c) => selectedCats[c.id])
      .map((c) => c.id);

    if (catsToCopy.length > 0) {
      onCopy(catsToCopy);
      onClose();
    }
  };

  const hasAnyYesterday = yesterdayLogs.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#141417] border border-[#27272a] rounded-t-3xl sm:rounded-2xl w-full max-w-sm flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <Copy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Copy from Yesterday</h3>
              <p className="text-[11px] text-zinc-400">Source: {yesterdayDate}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {hasAnyYesterday ? (
            <>
              <p className="text-xs text-zinc-400">
                Select which meals you want to replicate into today:
              </p>
              <div className="space-y-2">
                {categories.map((cat) => {
                  const catLogs = yesterdayLogs.filter((f) => f.meal_category === cat.id);
                  const calories = catLogs.reduce((acc, f) => acc + f.calories, 0);
                  const count = catLogs.length;

                  if (count === 0) return null;

                  return (
                    <label
                      key={cat.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-violet-500/40 cursor-pointer transition select-none"
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="checkbox"
                          checked={selectedCats[cat.id]}
                          onChange={() => toggleCategory(cat.id)}
                          className="w-4 h-4 rounded accent-violet-600 bg-zinc-800"
                        />
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <span>{cat.icon}</span>
                            <span>{cat.label}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {count} item{count > 1 ? "s" : ""} · {formatCalories(calories)} kcal
                          </div>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>

              <button
                onClick={handleCopy}
                className="w-full mt-2 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-violet-600/30 flex items-center justify-center gap-1.5 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Duplicate Selected Meals to Today</span>
              </button>
            </>
          ) : (
            <div className="text-center py-6 space-y-2">
              <div className="text-2xl">🍽️</div>
              <p className="text-xs text-zinc-400">No meals were logged on yesterday ({yesterdayDate}).</p>
              <button
                onClick={onClose}
                className="py-1.5 px-4 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
