"use client";

import { useState } from "react";
import { X, Search, Plus, Sparkles, Check } from "lucide-react";
import { Food, MealCategory } from "@/types/database";
import { formatCalories } from "@/lib/utils";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: Food[];
  initialCategory?: MealCategory;
  onLogFood: (data: {
    meal_category: MealCategory;
    food_id: string;
    food_name_snapshot: string;
    quantity: number;
    unit: string;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    notes?: string;
  }) => void;
  onCreateCustomFood: (food: Omit<Food, "id" | "user_id" | "created_at">) => void;
}

export function AddFoodModal({
  isOpen,
  onClose,
  foods,
  initialCategory = "lunch",
  onLogFood,
  onCreateCustomFood,
}: AddFoodModalProps) {
  const [category, setCategory] = useState<MealCategory>(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [quantity, setQuantity] = useState<number>(100);

  // New Custom Food Form toggle
  const [isCreatingCustom, setIsCreatingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
  const [customFat, setCustomFat] = useState("");
  const [customServing, setCustomServing] = useState("100g");

  if (!isOpen) return null;

  const filteredFoods = foods.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    setQuantity(food.reference_quantity || 100);
  };

  // Proportion calculations
  const ratio = selectedFood ? quantity / (selectedFood.reference_quantity || 100) : 1;
  const calcCalories = selectedFood ? Math.round(selectedFood.calories * ratio) : 0;
  const calcProtein = selectedFood ? Number((selectedFood.protein * ratio).toFixed(1)) : 0;
  const calcCarbs = selectedFood ? Number((selectedFood.carbohydrates * ratio).toFixed(1)) : 0;
  const calcFat = selectedFood ? Number((selectedFood.fat * ratio).toFixed(1)) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    onLogFood({
      meal_category: category,
      food_id: selectedFood.id,
      food_name_snapshot: selectedFood.name,
      quantity,
      unit: selectedFood.reference_unit || "g",
      calories: calcCalories,
      protein: calcProtein,
      carbohydrates: calcCarbs,
      fat: calcFat,
    });

    onClose();
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName || !customCalories) return;

    const newFood: Omit<Food, "id" | "user_id" | "created_at"> = {
      name: customName,
      category: "Custom",
      serving_description: customServing,
      reference_quantity: 100,
      reference_unit: "g",
      calories: parseFloat(customCalories) || 0,
      protein: parseFloat(customProtein) || 0,
      carbohydrates: parseFloat(customCarbs) || 0,
      fat: parseFloat(customFat) || 0,
    };

    onCreateCustomFood(newFood);
    setIsCreatingCustom(false);
    setSearchQuery(customName);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#141417] border border-[#27272a] rounded-t-3xl sm:rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Log Food</h3>
            <p className="text-xs text-zinc-400">Add to your daily nutrition records</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Meal Category Selector */}
        <div className="p-3 bg-[#18181b] border-b border-[#27272a]">
          <div className="grid grid-cols-4 gap-1">
            {(["breakfast", "lunch", "dinner", "snacks"] as MealCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                  category === cat
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!isCreatingCustom ? (
            <>
              {/* Search Bar & Create Button */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-zinc-400" />
                  <input
                    type="text"
                    placeholder="Search food library..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white placeholder-zinc-500 outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(true)}
                  className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 text-violet-400 border border-[#27272a] rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Custom</span>
                </button>
              </div>

              {/* Food Library Results */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {filteredFoods.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <button
                      key={food.id}
                      type="button"
                      onClick={() => handleSelectFood(food)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                        isSelected
                          ? "bg-violet-950/40 border-violet-500/80 text-white"
                          : "bg-[#18181b] border-[#27272a] hover:border-zinc-600 text-zinc-300"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold text-white">{food.name}</div>
                        <div className="text-[10px] text-zinc-400 font-mono">
                          {food.calories} kcal / {food.serving_description} · P: {food.protein}g · C:{" "}
                          {food.carbohydrates}g · F: {food.fat}g
                        </div>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-violet-400" />}
                    </button>
                  );
                })}

                {filteredFoods.length === 0 && (
                  <p className="text-center text-xs text-zinc-500 py-6">
                    No foods found. Click "+ Custom" to create this food.
                  </p>
                )}
              </div>

              {/* Selected Food Adjustment */}
              {selectedFood && (
                <div className="bg-[#18181b] border border-violet-500/30 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                        Selected Item
                      </span>
                      <h4 className="text-sm font-bold text-white">{selectedFood.name}</h4>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="2000"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, parseFloat(e.target.value) || 0))}
                        className="w-20 px-2 py-1.5 bg-[#141417] border border-[#27272a] focus:border-violet-500 rounded-lg text-sm font-bold text-center text-white outline-none font-mono"
                      />
                      <span className="text-xs text-zinc-400">{selectedFood.reference_unit || "g"}</span>
                    </div>
                  </div>

                  {/* Calculated Nutrients */}
                  <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#27272a] text-center">
                    <div className="bg-[#141417] p-1.5 rounded-lg">
                      <div className="text-[10px] text-zinc-400">Calories</div>
                      <div className="text-xs font-bold text-white font-mono">{calcCalories}</div>
                    </div>
                    <div className="bg-[#141417] p-1.5 rounded-lg">
                      <div className="text-[10px] text-rose-400">Protein</div>
                      <div className="text-xs font-bold text-rose-300 font-mono">{calcProtein}g</div>
                    </div>
                    <div className="bg-[#141417] p-1.5 rounded-lg">
                      <div className="text-[10px] text-amber-400">Carbs</div>
                      <div className="text-xs font-bold text-amber-300 font-mono">{calcCarbs}g</div>
                    </div>
                    <div className="bg-[#141417] p-1.5 rounded-lg">
                      <div className="text-[10px] text-emerald-400">Fat</div>
                      <div className="text-xs font-bold text-emerald-300 font-mono">{calcFat}g</div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Custom Food Form */
            <form onSubmit={handleSaveCustom} className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Create Custom Food Item</span>
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingCustom(false)}
                  className="text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Food Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Grandma's Chicken Curry"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">Serving Label</label>
                  <input
                    type="text"
                    value={customServing}
                    onChange={(e) => setCustomServing(e.target.value)}
                    placeholder="100g, 1 cup, 1 bowl"
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-zinc-400 mb-1 block">Calories (kcal)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 250"
                    value={customCalories}
                    onChange={(e) => setCustomCalories(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] text-rose-400 mb-1 block">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={customProtein}
                    onChange={(e) => setCustomProtein(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-amber-400 mb-1 block">Carbs (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={customCarbs}
                    onChange={(e) => setCustomCarbs(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-emerald-400 mb-1 block">Fat (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0"
                    value={customFat}
                    onChange={(e) => setCustomFat(e.target.value)}
                    className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-colors"
              >
                Save Food to My Library
              </button>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        {!isCreatingCustom && (
          <div className="p-4 border-t border-[#27272a] bg-[#18181b]">
            <button
              onClick={handleSubmit}
              disabled={!selectedFood}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:hover:bg-violet-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-violet-600/30"
            >
              Log to {category} ({calcCalories} kcal)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
