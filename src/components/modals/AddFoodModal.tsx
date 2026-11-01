"use client";

import { useState, useEffect, useMemo } from "react";
import { X, Search, Plus, Sparkles, Check, Zap, Scale, Flame, ArrowRight, Barcode, AlertCircle } from "lucide-react";
import { Food, MealCategory } from "@/types/database";
import { formatCalories } from "@/lib/utils";
import { BarcodeScannerModal } from "./BarcodeScannerModal";

interface AddFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  foods: Food[];
  initialCategory?: MealCategory;
  initialMode?: "library" | "quickAdd" | "scan";
  onLogFood: (data: {
    meal_category: MealCategory;
    food_id?: string | null;
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
  initialMode = "library",
  onLogFood,
  onCreateCustomFood,
}: AddFoodModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "quickAdd" | "custom">("library");
  const [category, setCategory] = useState<MealCategory>(initialCategory);

  // Search & Library state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("All");
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);

  // Dual Unit State
  const [unitMode, setUnitMode] = useState<"household" | "grams">("household");
  const [quantity, setQuantity] = useState<number>(1);

  // Quick Calorie Add State
  const [quickName, setQuickName] = useState("");
  const [quickCalories, setQuickCalories] = useState<number>(500);
  const [quickProtein, setQuickProtein] = useState<number>(25);
  const [quickCarbs, setQuickCarbs] = useState<number>(45);
  const [quickFat, setQuickFat] = useState<number>(12);

  // Custom Food Form State
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState("Custom");
  const [customServing, setCustomServing] = useState("100g");
  const [customCalories, setCustomCalories] = useState("");
  const [customProtein, setCustomProtein] = useState("");
  const [customCarbs, setCustomCarbs] = useState("");
   const [customFat, setCustomFat] = useState("");
  const [customHouseholdUnit, setCustomHouseholdUnit] = useState("");
  const [customHouseholdGrams, setCustomHouseholdGrams] = useState("");

  // Barcode Scanner State & Notifications
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [bannerNotice, setBannerNotice] = useState<{ type: "success" | "warning"; text: string } | null>(null);

  // Sync state whenever modal opens or props change
  useEffect(() => {
    if (isOpen) {
      setCategory(initialCategory);
      setActiveTab(initialMode === "scan" ? "library" : initialMode || "library");
      setSearchQuery("");
      setSelectedCategoryFilter("All");
      setSelectedFood(null);
      setUnitMode("household");
      setQuantity(1);
      setQuickName("");
      setBannerNotice(null);
      if (initialMode === "scan") {
        setIsBarcodeScannerOpen(true);
      }
    }
  }, [isOpen, initialCategory, initialMode]);

  // Handle scanned product found via OpenFoodFacts
  const handleScannedProductFound = (scannedFood: Food) => {
    setIsBarcodeScannerOpen(false);

    // Save into custom food database if not already existing
    const exists = foods.some(
      (f) =>
        f.name.toLowerCase() === scannedFood.name.toLowerCase() ||
        (f.notes && scannedFood.notes && f.notes === scannedFood.notes)
    );

    if (!exists) {
      onCreateCustomFood({
        name: scannedFood.name,
        category: scannedFood.category || "Packaged Food",
        serving_description: scannedFood.serving_description,
        reference_quantity: scannedFood.reference_quantity,
        reference_unit: scannedFood.reference_unit,
        calories: scannedFood.calories,
        protein: scannedFood.protein,
        carbohydrates: scannedFood.carbohydrates,
        fat: scannedFood.fat,
        household_unit: scannedFood.household_unit,
        household_grams: scannedFood.household_grams,
        notes: scannedFood.notes,
      });
    }

    setSelectedFood(scannedFood);
    if (scannedFood.household_unit && scannedFood.household_grams) {
      setUnitMode("household");
      setQuantity(1);
    } else {
      setUnitMode("grams");
      setQuantity(scannedFood.reference_quantity || 100);
    }

    setActiveTab("library");
    setSearchQuery(scannedFood.name);
    setBannerNotice({
      type: "success",
      text: `Scanned "${scannedFood.name}" (${scannedFood.calories} kcal / ${scannedFood.serving_description})`,
    });
  };

  // Handle barcode not found in OpenFoodFacts
  const handleScannedProductNotFound = (barcode: string) => {
    setIsBarcodeScannerOpen(false);
    setActiveTab("custom");
    setCustomName("");
    setCustomCategory("Packaged Food");
    setCustomServing("100g");
    setCustomHouseholdUnit("1 pack");
    setCustomHouseholdGrams("");
    setCustomCalories("");
    setCustomProtein("");
    setCustomCarbs("");
    setCustomFat("");
    setBannerNotice({
      type: "warning",
      text: `Barcode "${barcode}" not found in OpenFoodFacts. You can enter its package values below to save it.`,
    });
  };

  // Handle selecting a food item
  const handleSelectFood = (food: Food) => {
    setSelectedFood(food);
    if (food.household_unit && food.household_grams) {
      setUnitMode("household");
      setQuantity(1);
    } else {
      setUnitMode("grams");
      setQuantity(food.reference_quantity || 100);
    }
  };

  // Toggle between household units and grams
  const handleToggleUnitMode = (newMode: "household" | "grams") => {
    if (!selectedFood) return;
    if (newMode === unitMode) return;

    const hGrams = selectedFood.household_grams || selectedFood.reference_quantity || 100;

    if (newMode === "grams") {
      // Switching from household (e.g. 2 rotis) to grams (e.g. 70g)
      setQuantity(Math.round(quantity * hGrams));
      setUnitMode("grams");
    } else {
      // Switching from grams (e.g. 70g) to household (e.g. 2 rotis)
      const count = Math.max(0.5, Number((quantity / hGrams).toFixed(1)));
      setQuantity(count);
      setUnitMode("household");
    }
  };

  // Live Macros Calculation
  const calculatedMacros = useMemo(() => {
    if (!selectedFood) {
      return { calories: 0, protein: 0, carbs: 0, fat: 0, grams: 0 };
    }

    const refQty = selectedFood.reference_quantity || 100;
    let effectiveGrams = quantity;

    if (unitMode === "household" && selectedFood.household_grams) {
      effectiveGrams = quantity * selectedFood.household_grams;
    }

    const ratio = effectiveGrams / refQty;
    return {
      calories: Math.round(selectedFood.calories * ratio),
      protein: Number((selectedFood.protein * ratio).toFixed(1)),
      carbs: Number((selectedFood.carbohydrates * ratio).toFixed(1)),
      fat: Number((selectedFood.fat * ratio).toFixed(1)),
      grams: Math.round(effectiveGrams),
    };
  }, [selectedFood, unitMode, quantity]);

  // Submit Food Library entry
  const handleSubmitLibrary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFood) return;

    const unitLabel =
      unitMode === "household" && selectedFood.household_unit
        ? selectedFood.household_unit
        : selectedFood.reference_unit || "g";

    onLogFood({
      meal_category: category,
      food_id: selectedFood.id,
      food_name_snapshot: selectedFood.name,
      quantity,
      unit: unitLabel,
      calories: calculatedMacros.calories,
      protein: calculatedMacros.protein,
      carbohydrates: calculatedMacros.carbs,
      fat: calculatedMacros.fat,
      notes:
        unitMode === "household" && selectedFood.household_grams
          ? `~${calculatedMacros.grams}g (${selectedFood.household_unit})`
          : undefined,
    });

    onClose();
  };

  // Submit Quick Calorie Add entry
  const handleSubmitQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickCalories || quickCalories <= 0) return;

    const displayName = quickName.trim()
      ? quickName.trim()
      : `Quick Cal (${category.charAt(0).toUpperCase() + category.slice(1)})`;

    onLogFood({
      meal_category: category,
      food_id: null,
      food_name_snapshot: displayName,
      quantity: 1,
      unit: "serving",
      calories: Math.round(quickCalories),
      protein: Math.round(quickProtein || 0),
      carbohydrates: Math.round(quickCarbs || 0),
      fat: Math.round(quickFat || 0),
      notes: "⚡ Quick Calorie Add",
    });

    onClose();
  };

  // Submit Custom Food creation
  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customCalories) return;

    const cals = parseFloat(customCalories) || 0;
    const p = parseFloat(customProtein) || 0;
    const c = parseFloat(customCarbs) || 0;
    const f = parseFloat(customFat) || 0;
    const hGrams = customHouseholdGrams ? parseFloat(customHouseholdGrams) : null;

    const newFood: Omit<Food, "id" | "user_id" | "created_at"> = {
      name: customName.trim(),
      category: customCategory || "Custom",
      serving_description: customServing || "100g",
      reference_quantity: 100,
      reference_unit: "g",
      calories: cals,
      protein: p,
      carbohydrates: c,
      fat: f,
      household_unit: customHouseholdUnit.trim() || null,
      household_grams: hGrams,
    };

    onCreateCustomFood(newFood);
    setActiveTab("library");
    setSearchQuery(customName.trim());
  };

  if (!isOpen) return null;

  // Filter food library list
  const filteredFoods = foods.filter((f) => {
    const matchesCat =
      selectedCategoryFilter === "All" ||
      (selectedCategoryFilter === "Kerala Staples" && f.category === "Kerala Staples") ||
      (selectedCategoryFilter === "South Indian" && (f.category === "South Indian" || f.category === "Kerala Staples")) ||
      f.category === selectedCategoryFilter;

    const matchesQuery =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (f.notes && f.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCat && matchesQuery;
  });

  const categoryChips = [
    "All",
    "Kerala Staples",
    "South Indian",
    "Beverages",
    "Grains",
    "Bread",
    "Chicken & Meat",
    "Eggs",
    "Dairy",
    "Vegetarian Protein",
    "Legumes",
    "Fruits",
    "Nuts",
    "Custom",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-[#141417] border border-[#27272a] rounded-t-3xl sm:rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Log Nutrition</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {category}
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Indian & Kerala staples, household units, or ⚡ quick calorie entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Navigation Tabs */}
        <div className="px-3 sm:px-4 py-2 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1 min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab("library")}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                activeTab === "library"
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                  : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Library</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("quickAdd")}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                activeTab === "quickAdd"
                  ? "bg-amber-500 text-black shadow-md shadow-amber-500/30"
                  : "text-zinc-400 hover:text-amber-300 hover:bg-zinc-800"
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Quick</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("custom")}
              className={`py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 shrink-0 ${
                activeTab === "custom"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-zinc-400 hover:text-emerald-300 hover:bg-zinc-800"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Custom</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsBarcodeScannerOpen(true)}
            className="py-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-md shadow-violet-600/20 active:scale-95 shrink-0"
            title="Scan barcode on packaged food via camera"
          >
            <Barcode className="w-3.5 h-3.5" />
            <span>Scan</span>
          </button>
        </div>

        {/* Meal Category Bar */}
        <div className="px-3 sm:px-4 py-2 bg-[#121215] border-b border-[#27272a]">
          <div className="flex items-center justify-between gap-1.5">
            <span className="hidden sm:inline text-[10px] font-semibold text-zinc-400 uppercase tracking-wider shrink-0">
              Meal:
            </span>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 flex-1">
              {(
                [
                  { id: "breakfast", label: "Breakfast", shortLabel: "B'fast", icon: "🍳" },
                  { id: "lunch", label: "Lunch", shortLabel: "Lunch", icon: "🥗" },
                  { id: "dinner", label: "Dinner", shortLabel: "Dinner", icon: "🍛" },
                  { id: "snacks", label: "Snacks", shortLabel: "Snacks", icon: "🍎" },
                ] as const
              ).map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setCategory(m.id)}
                  className={`py-1 px-1 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    category === m.id
                      ? "bg-zinc-800 text-white border border-zinc-600 shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900"
                  }`}
                >
                  <span className="text-xs">{m.icon}</span>
                  <span className="hidden xs:inline truncate text-[11px] sm:text-xs">{m.label}</span>
                  <span className="xs:hidden truncate text-[10px]">{m.shortLabel}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scanned / Lookup Status Notification Banner */}
        {bannerNotice && (
          <div
            className={`mx-4 mt-2.5 p-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-fade-in ${
              bannerNotice.type === "success"
                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/15 border-amber-500/30 text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              {bannerNotice.type === "success" ? (
                <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              )}
              <span className="truncate">{bannerNotice.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setBannerNotice(null)}
              className="p-1 rounded-lg hover:bg-black/20 text-zinc-400 hover:text-white transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Tab 1: Food Library Search & Dual Unit Portioning */}
        {activeTab === "library" && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {/* Search Input & Scan Button */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search Idli, Dosa, Puttu, Roti, Rice, Chicken, Dal, Whey..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white placeholder-zinc-500 outline-none"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsBarcodeScannerOpen(true)}
                className="px-3 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-violet-600/20 shrink-0"
                title="Scan Barcode via Camera"
              >
                <Barcode className="w-4 h-4" />
                <span className="hidden xs:inline">Scan</span>
              </button>
            </div>

            {/* Category Filter Chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {categoryChips.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`py-1 px-2.5 rounded-xl text-[11px] font-semibold whitespace-nowrap transition-all ${
                    selectedCategoryFilter === cat
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                      : "bg-[#18181b] border border-[#27272a] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Food Results List */}
            <div className={`space-y-1.5 overflow-y-auto pr-1 transition-all ${selectedFood ? "max-h-24 sm:max-h-32" : "max-h-48 sm:max-h-56"}`}>
              {filteredFoods.map((food, idx) => {
                const isSelected = selectedFood?.id === food.id;
                return (
                  <button
                    key={`${food.id}-${idx}`}
                    type="button"
                    onClick={() => handleSelectFood(food)}
                    className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? "bg-violet-950/40 border-violet-500/80 text-white ring-1 ring-violet-500/50"
                        : "bg-[#18181b] border-[#27272a] hover:border-zinc-600 text-zinc-300"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white truncate">{food.name}</span>
                        {food.category && (
                          <span className="text-[9px] font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded shrink-0">
                            {food.category}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate">
                        {food.calories} kcal / {food.serving_description} · P: {food.protein}g · C:{" "}
                        {food.carbohydrates}g · F: {food.fat}g
                      </div>
                    </div>
                    {isSelected ? (
                      <Check className="w-4 h-4 text-violet-400 shrink-0" />
                    ) : (
                      <span className="text-[11px] font-mono font-bold text-zinc-300 shrink-0">
                        {food.calories} kcal
                      </span>
                    )}
                  </button>
                );
              })}

              {filteredFoods.length === 0 && (
                <div className="text-center py-6 space-y-2.5">
                  <p className="text-xs text-zinc-400">No foods found matching "{searchQuery}"</p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setCustomName(searchQuery);
                        setActiveTab("custom");
                      }}
                      className="text-xs font-bold text-emerald-400 hover:underline"
                    >
                      + Create "{searchQuery}"
                    </button>
                    <span className="text-zinc-600">·</span>
                    <button
                      type="button"
                      onClick={() => setIsBarcodeScannerOpen(true)}
                      className="text-xs font-bold text-violet-400 hover:underline flex items-center gap-1"
                    >
                      <Barcode className="w-3.5 h-3.5" />
                      <span>Scan Barcode</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* DUAL UNIT ADJUSTMENT PANEL FOR SELECTED FOOD */}
            {selectedFood && (
              <form onSubmit={handleSubmitLibrary} className="bg-[#18181b] border border-violet-500/40 rounded-2xl p-4 space-y-3.5 shadow-xl animate-fade-in">
                {/* Food Title & Unit Toggle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#27272a]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-violet-400">
                      Selected Item
                    </span>
                    <h4 className="text-sm font-bold text-white">{selectedFood.name}</h4>
                  </div>

                  {/* Dual Unit Toggle: Household Units <---> Grams */}
                  {selectedFood.household_unit && selectedFood.household_grams && (
                    <div className="flex items-center bg-[#121215] p-1 rounded-xl border border-zinc-700 self-start sm:self-auto">
                      <button
                        type="button"
                        onClick={() => handleToggleUnitMode("household")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          unitMode === "household"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <span>Household ({selectedFood.household_unit})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleUnitMode("grams")}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                          unitMode === "grams"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        <Scale className="w-3 h-3" />
                        <span>Grams (g)</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Serving Size Stepper */}
                <div className="flex items-center justify-between gap-3 bg-[#141417] p-3 rounded-xl border border-[#27272a]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                      Serving Portion
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">
                      {unitMode === "household" && selectedFood.household_unit
                        ? `${quantity} ${selectedFood.household_unit} (~${calculatedMacros.grams}g on scale)`
                        : `${quantity}g kitchen weight`}
                    </span>
                  </div>

                  {/* Stepper Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((prev) =>
                          unitMode === "household"
                            ? Math.max(0.5, prev - (prev <= 1 ? 0.5 : 1))
                            : Math.max(10, prev - 25)
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm flex items-center justify-center active:scale-95 transition"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      step="any"
                      min="0.1"
                      value={quantity === 0 ? "" : quantity}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setQuantity(isNaN(val) ? 0 : val);
                      }}
                      className="w-20 bg-[#18181b] border border-zinc-700 text-center font-bold font-mono text-white text-sm py-1 rounded-lg focus:outline-none focus:border-violet-500"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setQuantity((prev) =>
                          unitMode === "household"
                            ? prev + (prev < 1 ? 0.5 : 1)
                            : prev + 25
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm flex items-center justify-center active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Calculated Macros Display */}
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="bg-[#141417] p-2 rounded-xl border border-[#27272a]">
                    <div className="text-[10px] text-zinc-400 font-medium">Calories</div>
                    <div className="text-sm font-extrabold text-white font-mono">
                      {calculatedMacros.calories}
                    </div>
                  </div>
                  <div className="bg-[#141417] p-2 rounded-xl border border-rose-500/20">
                    <div className="text-[10px] text-rose-400 font-medium">Protein</div>
                    <div className="text-sm font-extrabold text-rose-300 font-mono">
                      {calculatedMacros.protein}g
                    </div>
                  </div>
                  <div className="bg-[#141417] p-2 rounded-xl border border-amber-500/20">
                    <div className="text-[10px] text-amber-400 font-medium">Carbs</div>
                    <div className="text-sm font-extrabold text-amber-300 font-mono">
                      {calculatedMacros.carbs}g
                    </div>
                  </div>
                  <div className="bg-[#141417] p-2 rounded-xl border border-emerald-500/20">
                    <div className="text-[10px] text-emerald-400 font-medium">Fat</div>
                    <div className="text-sm font-extrabold text-emerald-300 font-mono">
                      {calculatedMacros.fat}g
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-violet-600/30 transition-all active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    Log to {category.charAt(0).toUpperCase() + category.slice(1)} (
                    {calculatedMacros.calories} kcal)
                  </span>
                </button>
              </form>
            )}
          </div>
        )}

        {/* Tab 2: ⚡ Quick Calorie & Macro Add */}
        {activeTab === "quickAdd" && (
          <form onSubmit={handleSubmitQuickAdd} className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Zap className="w-5 h-5 fill-current" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-amber-200">Instant Calorie Entry</h4>
                <p className="text-[11px] text-zinc-400">
                  Quickly log estimated calories for restaurant foods, street meals, or fast tracking.
                </p>
              </div>
            </div>

            {/* 1-Tap Quick Presets */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-300">1-Tap Fast Presets:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setQuickName("Light Snack / Chai");
                    setQuickCalories(250);
                    setQuickProtein(10);
                    setQuickCarbs(30);
                    setQuickFat(8);
                  }}
                  className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95 group"
                >
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300">
                    ☕ Light Snack
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    250 kcal · 10g P · 30g C
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickName("Standard Meal");
                    setQuickCalories(500);
                    setQuickProtein(30);
                    setQuickCarbs(55);
                    setQuickFat(14);
                  }}
                  className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95 group"
                >
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300">
                    🥗 Standard Meal
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    500 kcal · 30g P · 55g C
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickName("Heavy Indian Feast");
                    setQuickCalories(750);
                    setQuickProtein(40);
                    setQuickCarbs(80);
                    setQuickFat(25);
                  }}
                  className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95 group"
                >
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300">
                    🍛 Indian Feast / Sadhya
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    750 kcal · 40g P · 80g C
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setQuickName("Cheat Meal / Buffet");
                    setQuickCalories(1000);
                    setQuickProtein(45);
                    setQuickCarbs(110);
                    setQuickFat(38);
                  }}
                  className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95 group"
                >
                  <span className="text-xs font-bold text-white block group-hover:text-amber-300">
                    🍕 Cheat Meal / Buffet
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    1,000 kcal · 45g P · 110g C
                  </span>
                </button>
              </div>
            </div>

            {/* Item Description (Optional) */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-300">Description / Food Name (Optional):</label>
              <input
                type="text"
                placeholder="e.g. Chicken Biryani, Dosa at restaurant, Protein Shake"
                value={quickName}
                onChange={(e) => setQuickName(e.target.value)}
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Exact Calorie & Protein Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Calories (kcal)*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="5000"
                  value={quickCalories}
                  onChange={(e) => setQuickCalories(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#18181b] border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-rose-400">Protein (grams)*</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={quickProtein}
                  onChange={(e) => setQuickProtein(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#18181b] border border-zinc-700 focus:border-rose-500 rounded-xl px-3 py-2 text-sm font-mono font-bold text-rose-300 outline-none"
                />
              </div>
            </div>

            {/* Carbs & Fat Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-amber-400">Carbs (grams)</label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={quickCarbs}
                  onChange={(e) => setQuickCarbs(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#18181b] border border-zinc-700 focus:border-amber-500 rounded-xl px-3 py-2 text-sm font-mono text-amber-300 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-400">Fat (grams)</label>
                <input
                  type="number"
                  min="0"
                  max="300"
                  value={quickFat}
                  onChange={(e) => setQuickFat(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-[#18181b] border border-zinc-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-sm font-mono text-emerald-300 outline-none"
                />
              </div>
            </div>

            {/* Submit Quick Add */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all active:scale-95 mt-2"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                Log {Math.round(quickCalories)} kcal to{" "}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </span>
            </button>
          </form>
        )}

        {/* Tab 3: Create Custom Food */}
        {activeTab === "custom" && (
          <form onSubmit={handleSaveCustom} className="flex-1 overflow-y-auto p-4 space-y-3.5">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <p className="text-xs text-zinc-300">
                Create and save a new custom ingredient or family recipe to your database.
              </p>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Food Name*</label>
              <input
                type="text"
                required
                placeholder="e.g. Amma's Sambar or Homemade Whey Shake"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Category</label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g. South Indian, Curry, Snack"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Serving Label</label>
                <input
                  type="text"
                  value={customServing}
                  onChange={(e) => setCustomServing(e.target.value)}
                  placeholder="100g, 1 bowl, 1 piece"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-emerald-400 mb-1 block">Household Unit (Optional)</label>
                <input
                  type="text"
                  value={customHouseholdUnit}
                  onChange={(e) => setCustomHouseholdUnit(e.target.value)}
                  placeholder="e.g. piece, katori, scoop, cup"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-emerald-400 mb-1 block">Grams per Household Unit</label>
                <input
                  type="number"
                  value={customHouseholdGrams}
                  onChange={(e) => setCustomHouseholdGrams(e.target.value)}
                  placeholder="e.g. 50 (if 1 piece = 50g)"
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-zinc-400 mb-1 block">Calories (kcal per 100g)*</label>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder="e.g. 200"
                  value={customCalories}
                  onChange={(e) => setCustomCalories(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-rose-400 mb-1 block">Protein (g per 100g)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 15"
                  value={customProtein}
                  onChange={(e) => setCustomProtein(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-amber-400 mb-1 block">Carbs (g per 100g)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 25"
                  value={customCarbs}
                  onChange={(e) => setCustomCarbs(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] text-emerald-400 mb-1 block">Fat (g per 100g)</label>
                <input
                  type="number"
                  step="any"
                  placeholder="e.g. 5"
                  value={customFat}
                  onChange={(e) => setCustomFat(e.target.value)}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Save to Food Database</span>
            </button>
          </form>
        )}

        {/* Barcode Scanner Viewfinder Modal */}
        <BarcodeScannerModal
          isOpen={isBarcodeScannerOpen}
          onClose={() => setIsBarcodeScannerOpen(false)}
          onProductFound={handleScannedProductFound}
          onProductNotFound={handleScannedProductNotFound}
        />
      </div>
    </div>
  );
}
