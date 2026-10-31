"use client";

import { useState, useMemo } from "react";
import {
  Utensils,
  Flame,
  Droplets,
  Plus,
  Trash2,
  Zap,
  Star,
  Search,
  Check,
  X,
  ChevronRight,
  Info,
  Sparkles,
  Bookmark,
  Scale,
  RotateCcw,
  PlusCircle,
  Copy,
  Edit3,
} from "lucide-react";

// Types
export type MealCategory = "breakfast" | "lunch" | "snacks" | "dinner";

export interface LoggedFoodItem {
  id: string;
  foodId?: string;
  name: string;
  category: string;
  quantity: number;
  unitMode: "household" | "grams";
  unitLabel: string;
  grams: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isQuickAdd?: boolean;
}

export interface FoodDatabaseItem {
  id: string;
  name: string;
  category: "Indian Staples" | "High Protein" | "Dairy & Whey" | "Grains & Carbs" | "Snacks & Nuts";
  householdUnit: string;
  householdGrams: number;
  calPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  defaultQty: number;
  isIndian: boolean;
}

export interface SavedMealCombo {
  id: string;
  name: string;
  description: string;
  tag: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  items: {
    name: string;
    portionDisplay: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
}

// Indian & Lifter Food Database
export const INDIAN_FOOD_DATABASE: FoodDatabaseItem[] = [
  // Indian Staples
  {
    id: "f-roti",
    name: "Roti / Wheat Chapati",
    category: "Indian Staples",
    householdUnit: "roti",
    householdGrams: 35,
    calPer100g: 245,
    proteinPer100g: 8.9,
    carbsPer100g: 44.3,
    fatPer100g: 2.5,
    defaultQty: 2,
    isIndian: true,
  },
  {
    id: "f-rice",
    name: "Cooked White Rice (Basmati)",
    category: "Indian Staples",
    householdUnit: "katori",
    householdGrams: 150,
    calPer100g: 130,
    proteinPer100g: 2.7,
    carbsPer100g: 28.2,
    fatPer100g: 0.3,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-dal",
    name: "Yellow Dal Tadka (Moong/Toor)",
    category: "Indian Staples",
    householdUnit: "katori",
    householdGrams: 150,
    calPer100g: 100,
    proteinPer100g: 5.5,
    carbsPer100g: 13.0,
    fatPer100g: 2.8,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-rajma",
    name: "Rajma Masala (Cooked)",
    category: "Indian Staples",
    householdUnit: "katori",
    householdGrams: 180,
    calPer100g: 120,
    proteinPer100g: 6.0,
    carbsPer100g: 18.0,
    fatPer100g: 3.0,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-chana",
    name: "Chana Masala (Chickpeas)",
    category: "Indian Staples",
    householdUnit: "katori",
    householdGrams: 180,
    calPer100g: 135,
    proteinPer100g: 6.8,
    carbsPer100g: 20.0,
    fatPer100g: 3.2,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-idli",
    name: "Steamed Idli",
    category: "Indian Staples",
    householdUnit: "pieces (2)",
    householdGrams: 100,
    calPer100g: 130,
    proteinPer100g: 4.0,
    carbsPer100g: 26.0,
    fatPer100g: 0.5,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-dosa",
    name: "Plain Dosa (Homemade)",
    category: "Indian Staples",
    householdUnit: "dosa",
    householdGrams: 80,
    calPer100g: 205,
    proteinPer100g: 4.5,
    carbsPer100g: 35.0,
    fatPer100g: 5.0,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-poha",
    name: "Poha (Cooked with veggies)",
    category: "Indian Staples",
    householdUnit: "katori",
    householdGrams: 150,
    calPer100g: 150,
    proteinPer100g: 2.5,
    carbsPer100g: 28.0,
    fatPer100g: 3.0,
    defaultQty: 1,
    isIndian: true,
  },

  // High Protein
  {
    id: "f-chicken-breast",
    name: "Chicken Breast (Cooked, Grilled)",
    category: "High Protein",
    householdUnit: "portion",
    householdGrams: 100,
    calPer100g: 165,
    proteinPer100g: 31.0,
    carbsPer100g: 0.0,
    fatPer100g: 3.6,
    defaultQty: 1.5,
    isIndian: false,
  },
  {
    id: "f-paneer",
    name: "Fresh Paneer (Raw/Cubes)",
    category: "High Protein",
    householdUnit: "4 cubes",
    householdGrams: 100,
    calPer100g: 265,
    proteinPer100g: 18.3,
    carbsPer100g: 3.4,
    fatPer100g: 20.8,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-egg-whole",
    name: "Whole Boiled Egg",
    category: "High Protein",
    householdUnit: "egg",
    householdGrams: 50,
    calPer100g: 155,
    proteinPer100g: 12.6,
    carbsPer100g: 1.1,
    fatPer100g: 10.6,
    defaultQty: 3,
    isIndian: false,
  },
  {
    id: "f-egg-white",
    name: "Boiled Egg White",
    category: "High Protein",
    householdUnit: "white",
    householdGrams: 33,
    calPer100g: 52,
    proteinPer100g: 10.9,
    carbsPer100g: 0.7,
    fatPer100g: 0.2,
    defaultQty: 4,
    isIndian: false,
  },
  {
    id: "f-soya",
    name: "Soya Chunks (Raw/Uncooked)",
    category: "High Protein",
    householdUnit: "1/2 cup",
    householdGrams: 50,
    calPer100g: 345,
    proteinPer100g: 52.0,
    carbsPer100g: 33.0,
    fatPer100g: 0.5,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-fish",
    name: "Fish Fillet (Rohu/Katla/Tilapia Grilled)",
    category: "High Protein",
    householdUnit: "fillet",
    householdGrams: 120,
    calPer100g: 110,
    proteinPer100g: 22.0,
    carbsPer100g: 0.0,
    fatPer100g: 2.5,
    defaultQty: 1,
    isIndian: true,
  },

  // Dairy & Whey
  {
    id: "f-whey",
    name: "Whey Protein Isolate (Any brand)",
    category: "Dairy & Whey",
    householdUnit: "scoop",
    householdGrams: 30,
    calPer100g: 400,
    proteinPer100g: 80.0,
    carbsPer100g: 6.6,
    fatPer100g: 3.3,
    defaultQty: 1,
    isIndian: false,
  },
  {
    id: "f-curd",
    name: "Homemade Curd / Dahi",
    category: "Dairy & Whey",
    householdUnit: "katori",
    householdGrams: 150,
    calPer100g: 65,
    proteinPer100g: 3.5,
    carbsPer100g: 4.7,
    fatPer100g: 3.5,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-milk",
    name: "Toned Cow Milk",
    category: "Dairy & Whey",
    householdUnit: "glass (250ml)",
    householdGrams: 250,
    calPer100g: 60,
    proteinPer100g: 3.2,
    carbsPer100g: 4.8,
    fatPer100g: 3.1,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-greek-yogurt",
    name: "Plain Greek Yogurt (Epigamia)",
    category: "Dairy & Whey",
    householdUnit: "cup (100g)",
    householdGrams: 100,
    calPer100g: 85,
    proteinPer100g: 8.5,
    carbsPer100g: 5.0,
    fatPer100g: 3.2,
    defaultQty: 1,
    isIndian: true,
  },

  // Grains & Carbs
  {
    id: "f-oats",
    name: "Rolled Oats (Raw)",
    category: "Grains & Carbs",
    householdUnit: "bowl",
    householdGrams: 50,
    calPer100g: 389,
    proteinPer100g: 16.9,
    carbsPer100g: 66.3,
    fatPer100g: 6.9,
    defaultQty: 1,
    isIndian: false,
  },
  {
    id: "f-bread",
    name: "Whole Wheat Brown Bread",
    category: "Grains & Carbs",
    householdUnit: "slice",
    householdGrams: 30,
    calPer100g: 250,
    proteinPer100g: 11.5,
    carbsPer100g: 43.0,
    fatPer100g: 3.3,
    defaultQty: 2,
    isIndian: false,
  },
  {
    id: "f-sweet-potato",
    name: "Boiled Sweet Potato (Shakarkandi)",
    category: "Grains & Carbs",
    householdUnit: "medium",
    householdGrams: 150,
    calPer100g: 86,
    proteinPer100g: 1.6,
    carbsPer100g: 20.1,
    fatPer100g: 0.1,
    defaultQty: 1,
    isIndian: true,
  },

  // Snacks & Nuts
  {
    id: "f-peanut-butter",
    name: "Natural Peanut Butter (Unsweetened)",
    category: "Snacks & Nuts",
    householdUnit: "tbsp",
    householdGrams: 32,
    calPer100g: 588,
    proteinPer100g: 25.0,
    carbsPer100g: 20.0,
    fatPer100g: 50.0,
    defaultQty: 1,
    isIndian: false,
  },
  {
    id: "f-banana",
    name: "Banana (Fresh)",
    category: "Snacks & Nuts",
    householdUnit: "medium",
    householdGrams: 120,
    calPer100g: 89,
    proteinPer100g: 1.1,
    carbsPer100g: 22.8,
    fatPer100g: 0.3,
    defaultQty: 1,
    isIndian: true,
  },
  {
    id: "f-almonds",
    name: "Raw Almonds (Badam)",
    category: "Snacks & Nuts",
    householdUnit: "10 pieces",
    householdGrams: 15,
    calPer100g: 579,
    proteinPer100g: 21.0,
    carbsPer100g: 22.0,
    fatPer100g: 49.0,
    defaultQty: 1,
    isIndian: true,
  },
];

// Pre-configured Saved Indian Lifter Combos (Requirement 4)
export const DEFAULT_SAVED_COMBOS: SavedMealCombo[] = [
  {
    id: "combo-post-workout",
    name: "🏋️ Post-Workout Muscle Shake",
    description: "Whey Isolate + Banana + 250ml Toned Milk for rapid protein synthesis",
    tag: "Post-Workout",
    calories: 377,
    protein: 33.3,
    carbs: 41.4,
    fat: 9.2,
    items: [
      { name: "Whey Protein Isolate", portionDisplay: "1 scoop (30g)", calories: 120, protein: 24.0, carbs: 2.0, fat: 1.0 },
      { name: "Banana", portionDisplay: "1 medium (120g)", calories: 107, protein: 1.3, carbs: 27.4, fat: 0.4 },
      { name: "Toned Cow Milk", portionDisplay: "1 glass (250ml)", calories: 150, protein: 8.0, carbs: 12.0, fat: 7.8 },
    ],
  },
  {
    id: "combo-indian-chicken-lunch",
    name: "🍛 Classic High-Protein Indian Lunch",
    description: "2 Rotis + 150g Grilled Chicken + 1 Katori Dal + Fresh Salad",
    tag: "High Protein",
    calories: 593,
    protein: 61.9,
    carbs: 54.5,
    fat: 11.4,
    items: [
      { name: "Roti / Wheat Chapati", portionDisplay: "2 rotis (70g)", calories: 170, protein: 6.2, carbs: 31.0, fat: 1.8 },
      { name: "Chicken Breast (Cooked, Grilled)", portionDisplay: "150g portion", calories: 248, protein: 46.5, carbs: 0.0, fat: 5.4 },
      { name: "Yellow Dal Tadka", portionDisplay: "1 katori (150g)", calories: 150, protein: 8.2, carbs: 19.5, fat: 4.2 },
      { name: "Salad (Cucumber & Onion)", portionDisplay: "1 bowl (100g)", calories: 25, protein: 1.0, carbs: 4.0, fat: 0.2 },
    ],
  },
  {
    id: "combo-paneer-plate",
    name: "🧀 Vegetarian Paneer Power Plate",
    description: "120g Paneer + 2 Rotis + 1 Katori Dal + 1 Katori Curd",
    tag: "Vegetarian",
    calories: 736,
    protein: 43.4,
    carbs: 57.6,
    fat: 38.6,
    items: [
      { name: "Fresh Paneer", portionDisplay: "120g portion", calories: 318, protein: 22.0, carbs: 4.1, fat: 25.0 },
      { name: "Roti / Wheat Chapati", portionDisplay: "2 rotis (70g)", calories: 170, protein: 6.2, carbs: 31.0, fat: 1.8 },
      { name: "Yellow Dal Tadka", portionDisplay: "1 katori (150g)", calories: 150, protein: 8.2, carbs: 19.5, fat: 4.2 },
      { name: "Homemade Curd / Dahi", portionDisplay: "1 katori (150g)", calories: 98, protein: 7.0, carbs: 3.0, fat: 7.6 },
    ],
  },
  {
    id: "combo-lifter-breakfast",
    name: "🍳 Quick Lifter Egg Breakfast",
    description: "3 Whole Boiled Eggs + 2 Brown Bread Slices + Black Coffee",
    tag: "Quick Fuel",
    calories: 389,
    protein: 26.2,
    carbs: 28.6,
    fat: 17.9,
    items: [
      { name: "Whole Boiled Egg", portionDisplay: "3 eggs (150g)", calories: 234, protein: 18.9, carbs: 1.8, fat: 15.9 },
      { name: "Whole Wheat Brown Bread", portionDisplay: "2 slices (60g)", calories: 150, protein: 7.0, carbs: 26.0, fat: 2.0 },
      { name: "Black Coffee", portionDisplay: "1 cup (sugar-free)", calories: 5, protein: 0.3, carbs: 0.8, fat: 0.0 },
    ],
  },
  {
    id: "combo-oats-whey",
    name: "🥣 Power Protein Morning Oats",
    description: "50g Rolled Oats + 1 Scoop Whey + 1 tbsp Peanut Butter",
    tag: "Clean Bulk",
    calories: 503,
    protein: 40.5,
    carbs: 41.6,
    fat: 20.5,
    items: [
      { name: "Rolled Oats (Raw)", portionDisplay: "1 bowl (50g)", calories: 195, protein: 8.5, carbs: 33.2, fat: 3.5 },
      { name: "Whey Protein Isolate", portionDisplay: "1 scoop (30g)", calories: 120, protein: 24.0, carbs: 2.0, fat: 1.0 },
      { name: "Natural Peanut Butter", portionDisplay: "1 tbsp (32g)", calories: 188, protein: 8.0, carbs: 6.4, fat: 16.0 },
    ],
  },
];

interface Module4NutritionSketchProps {
  isMobileSim: boolean;
  viewMode: string;
  showToast: (msg: string) => void;
}

export function Module4NutritionSketch({
  isMobileSim,
  viewMode,
  showToast,
}: Module4NutritionSketchProps) {
  // Daily Goals (Lifter defaults)
  const CALORIE_GOAL = 2200;
  const PROTEIN_GOAL = 160;
  const CARBS_GOAL = 220;
  const FAT_GOAL = 65;
  const WATER_GOAL = 3500;

  // Active sub-tab inside Module 4
  const [activeSubTab, setActiveSubTab] = useState<"meals" | "quickAdd" | "combos" | "notes">("meals");

  // Water Hydration State
  const [waterMl, setWaterMl] = useState(2500);

  // Logged Meals State
  const [loggedMeals, setLoggedMeals] = useState<Record<MealCategory, LoggedFoodItem[]>>({
    breakfast: [
      {
        id: "b-1",
        name: "Whole Boiled Egg",
        category: "High Protein",
        quantity: 3,
        unitMode: "household",
        unitLabel: "eggs",
        grams: 150,
        calories: 234,
        protein: 18.9,
        carbs: 1.8,
        fat: 15.9,
      },
      {
        id: "b-2",
        name: "Whole Wheat Brown Bread",
        category: "Grains & Carbs",
        quantity: 2,
        unitMode: "household",
        unitLabel: "slices",
        grams: 60,
        calories: 150,
        protein: 7.0,
        carbs: 26.0,
        fat: 2.0,
      },
      {
        id: "b-3",
        name: "Black Coffee (sugar-free)",
        category: "Beverage",
        quantity: 1,
        unitMode: "household",
        unitLabel: "cup",
        grams: 200,
        calories: 5,
        protein: 0.3,
        carbs: 0.8,
        fat: 0.0,
      },
    ],
    lunch: [
      {
        id: "l-1",
        name: "Roti / Wheat Chapati",
        category: "Indian Staples",
        quantity: 2,
        unitMode: "household",
        unitLabel: "rotis",
        grams: 70,
        calories: 170,
        protein: 6.2,
        carbs: 31.0,
        fat: 1.8,
      },
      {
        id: "l-2",
        name: "Chicken Breast (Cooked, Grilled)",
        category: "High Protein",
        quantity: 150,
        unitMode: "grams",
        unitLabel: "g",
        grams: 150,
        calories: 248,
        protein: 46.5,
        carbs: 0.0,
        fat: 5.4,
      },
      {
        id: "l-3",
        name: "Yellow Dal Tadka",
        category: "Indian Staples",
        quantity: 1,
        unitMode: "household",
        unitLabel: "katori",
        grams: 150,
        calories: 150,
        protein: 8.2,
        carbs: 19.5,
        fat: 4.2,
      },
      {
        id: "l-4",
        name: "Cucumber & Onion Salad",
        category: "Indian Staples",
        quantity: 1,
        unitMode: "household",
        unitLabel: "bowl",
        grams: 100,
        calories: 25,
        protein: 1.0,
        carbs: 4.0,
        fat: 0.2,
      },
    ],
    snacks: [
      {
        id: "s-1",
        name: "Whey Protein Isolate",
        category: "Dairy & Whey",
        quantity: 1,
        unitMode: "household",
        unitLabel: "scoop",
        grams: 30,
        calories: 120,
        protein: 24.0,
        carbs: 2.0,
        fat: 1.0,
      },
      {
        id: "s-2",
        name: "Banana (Fresh)",
        category: "Snacks & Nuts",
        quantity: 1,
        unitMode: "household",
        unitLabel: "medium",
        grams: 120,
        calories: 107,
        protein: 1.3,
        carbs: 27.4,
        fat: 0.4,
      },
      {
        id: "s-3",
        name: "Toned Cow Milk",
        category: "Dairy & Whey",
        quantity: 1,
        unitMode: "household",
        unitLabel: "glass (250ml)",
        grams: 250,
        calories: 150,
        protein: 8.0,
        carbs: 12.0,
        fat: 7.8,
      },
    ],
    dinner: [
      {
        id: "d-1",
        name: "Restaurant Chicken Biryani (Estimate)",
        category: "Quick Add",
        quantity: 1,
        unitMode: "household",
        unitLabel: "portion",
        grams: 350,
        calories: 620,
        protein: 28.0,
        carbs: 72.0,
        fat: 22.0,
        isQuickAdd: true,
      },
    ],
  });

  // Saved Combos Library (Requirement 4)
  const [savedCombos, setSavedCombos] = useState<SavedMealCombo[]>(DEFAULT_SAVED_COMBOS);

  // Modal States
  const [isFoodModalOpen, setIsFoodModalOpen] = useState(false);
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isCombosModalOpen, setIsCombosModalOpen] = useState(false);
  const [isSaveComboModalOpen, setIsSaveComboModalOpen] = useState(false);
  const [activeMealTarget, setActiveMealTarget] = useState<MealCategory>("lunch");

  // Food Modal Selected Food State (Dual Unit Engine)
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [selectedFood, setSelectedFood] = useState<FoodDatabaseItem | null>(INDIAN_FOOD_DATABASE[0]);
  const [unitMode, setUnitMode] = useState<"household" | "grams">("household");
  const [quantity, setQuantity] = useState<number>(2);

  // Quick Calorie Add State (Requirement 3)
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddCalories, setQuickAddCalories] = useState<number>(500);
  const [quickAddProtein, setQuickAddProtein] = useState<number>(30);
  const [quickAddCarbs, setQuickAddCarbs] = useState<number>(45);
  const [quickAddFat, setQuickAddFat] = useState<number>(15);

  // Save Combo Form State
  const [comboNameInput, setComboNameInput] = useState("");
  const [comboTagInput, setComboTagInput] = useState("Custom");

  // Combo Editing / Customization State
  const [isEditComboModalOpen, setIsEditComboModalOpen] = useState(false);
  const [editingCombo, setEditingCombo] = useState<SavedMealCombo | null>(null);
  const [isComboFoodPickerOpen, setIsComboFoodPickerOpen] = useState(false);
  const [comboFoodSearchQuery, setComboFoodSearchQuery] = useState("");

  // Daily Calculations
  const allLoggedItems = useMemo(() => {
    return Object.values(loggedMeals).flat();
  }, [loggedMeals]);

  const totalCalories = useMemo(
    () => allLoggedItems.reduce((acc, item) => acc + item.calories, 0),
    [allLoggedItems]
  );
  const totalProtein = useMemo(
    () => Math.round(allLoggedItems.reduce((acc, item) => acc + item.protein, 0) * 10) / 10,
    [allLoggedItems]
  );
  const totalCarbs = useMemo(
    () => Math.round(allLoggedItems.reduce((acc, item) => acc + item.carbs, 0) * 10) / 10,
    [allLoggedItems]
  );
  const totalFat = useMemo(
    () => Math.round(allLoggedItems.reduce((acc, item) => acc + item.fat, 0) * 10) / 10,
    [allLoggedItems]
  );

  const remainingCalories = CALORIE_GOAL - totalCalories;
  const remainingProtein = Math.max(0, Math.round((PROTEIN_GOAL - totalProtein) * 10) / 10);
  const remainingCarbs = Math.max(0, Math.round((CARBS_GOAL - totalCarbs) * 10) / 10);
  const remainingFat = Math.max(0, Math.round((FAT_GOAL - totalFat) * 10) / 10);

  // Calories per meal subtotal helper
  const getMealSubtotal = (category: MealCategory) => {
    const items = loggedMeals[category];
    const cals = items.reduce((acc, item) => acc + item.calories, 0);
    const p = Math.round(items.reduce((acc, item) => acc + item.protein, 0) * 10) / 10;
    return { cals, p, count: items.length };
  };

  // Dual Unit Dynamic Macro Calculation for Food Modal
  const calculatedMacros = useMemo(() => {
    if (!selectedFood) return { grams: 0, cals: 0, p: 0, c: 0, f: 0 };
    const effectiveGrams =
      unitMode === "household" ? quantity * selectedFood.householdGrams : quantity;
    const factor = effectiveGrams / 100;
    return {
      grams: Math.round(effectiveGrams),
      cals: Math.round(selectedFood.calPer100g * factor),
      p: Math.round(selectedFood.proteinPer100g * factor * 10) / 10,
      c: Math.round(selectedFood.carbsPer100g * factor * 10) / 10,
      f: Math.round(selectedFood.fatPer100g * factor * 10) / 10,
    };
  }, [selectedFood, unitMode, quantity]);

  // Handlers
  const handleOpenFoodModal = (meal: MealCategory) => {
    setActiveMealTarget(meal);
    setIsFoodModalOpen(true);
  };

  const handleOpenQuickAdd = (meal: MealCategory) => {
    setActiveMealTarget(meal);
    setIsQuickAddModalOpen(true);
  };

  const handleOpenCombos = (meal: MealCategory) => {
    setActiveMealTarget(meal);
    setIsCombosModalOpen(true);
  };

  const handleSelectFoodItem = (food: FoodDatabaseItem) => {
    setSelectedFood(food);
    setUnitMode("household");
    setQuantity(food.defaultQty);
  };

  const handleCommitFoodLog = () => {
    if (!selectedFood) return;

    const newItem: LoggedFoodItem = {
      id: "food-" + Date.now(),
      foodId: selectedFood.id,
      name: selectedFood.name,
      category: selectedFood.category,
      quantity: quantity,
      unitMode: unitMode,
      unitLabel: unitMode === "household" ? selectedFood.householdUnit : "g",
      grams: calculatedMacros.grams,
      calories: calculatedMacros.cals,
      protein: calculatedMacros.p,
      carbs: calculatedMacros.c,
      fat: calculatedMacros.f,
    };

    setLoggedMeals((prev) => ({
      ...prev,
      [activeMealTarget]: [...prev[activeMealTarget], newItem],
    }));

    setIsFoodModalOpen(false);
    showToast(`Logged ${newItem.name} (+${newItem.calories} kcal, +${newItem.protein}g P)`);
  };

  const handleCommitQuickAdd = () => {
    if (quickAddCalories <= 0) return;

    const nameDisplay = quickAddName.trim() || "Quick Calorie Estimate";
    const newItem: LoggedFoodItem = {
      id: "quick-" + Date.now(),
      name: nameDisplay,
      category: "Quick Add",
      quantity: 1,
      unitMode: "household",
      unitLabel: "serving",
      grams: 250,
      calories: quickAddCalories,
      protein: quickAddProtein,
      carbs: quickAddCarbs,
      fat: quickAddFat,
      isQuickAdd: true,
    };

    setLoggedMeals((prev) => ({
      ...prev,
      [activeMealTarget]: [...prev[activeMealTarget], newItem],
    }));

    setIsQuickAddModalOpen(false);
    setQuickAddName("");
    showToast(`⚡ Quick Logged: ${nameDisplay} (+${quickAddCalories} kcal, +${quickAddProtein}g P)`);
  };

  const handleLogComboToMeal = (combo: SavedMealCombo) => {
    const newItems: LoggedFoodItem[] = combo.items.map((item, idx) => ({
      id: `combo-${combo.id}-${Date.now()}-${idx}`,
      name: item.name,
      category: combo.tag,
      quantity: 1,
      unitMode: "household",
      unitLabel: item.portionDisplay,
      grams: 100,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fat: item.fat,
    }));

    setLoggedMeals((prev) => ({
      ...prev,
      [activeMealTarget]: [...prev[activeMealTarget], ...newItems],
    }));

    setIsCombosModalOpen(false);
    showToast(`⭐ 1-Tap Logged: "${combo.name}" (+${combo.calories} kcal, +${combo.protein}g P)`);
  };

  const handleDeleteFoodItem = (meal: MealCategory, id: string) => {
    setLoggedMeals((prev) => ({
      ...prev,
      [meal]: prev[meal].filter((i) => i.id !== id),
    }));
    showToast("Food removed from meal");
  };

  const handleAdjustItemQuantity = (meal: MealCategory, id: string, delta: number) => {
    setLoggedMeals((prev) => {
      const items = [...prev[meal]];
      const idx = items.findIndex((i) => i.id === id);
      if (idx === -1) return prev;

      const item = items[idx];
      const newQty = Math.max(1, item.quantity + delta);
      if (newQty === item.quantity) return prev;

      const ratio = newQty / item.quantity;
      items[idx] = {
        ...item,
        quantity: newQty,
        grams: Math.round(item.grams * ratio),
        calories: Math.round(item.calories * ratio),
        protein: Math.round(item.protein * ratio * 10) / 10,
        carbs: Math.round(item.carbs * ratio * 10) / 10,
        fat: Math.round(item.fat * ratio * 10) / 10,
      };

      return { ...prev, [meal]: items };
    });
  };

  const handleAddWater = (ml: number) => {
    setWaterMl((prev) => Math.min(WATER_GOAL + 1000, prev + ml));
    showToast(`💧 Added ${ml}ml Water (${waterMl + ml}ml logged)`);
  };

  const handleSaveCurrentMealAsCombo = (meal: MealCategory) => {
    const items = loggedMeals[meal];
    if (items.length === 0) {
      showToast("Cannot save empty meal as combo");
      return;
    }
    setActiveMealTarget(meal);
    setComboNameInput(`${meal.charAt(0).toUpperCase() + meal.slice(1)} Favorite Combo`);
    setIsSaveComboModalOpen(true);
  };

  const handleCommitSaveCombo = () => {
    const items = loggedMeals[activeMealTarget];
    const totalCal = items.reduce((acc, i) => acc + i.calories, 0);
    const totalP = Math.round(items.reduce((acc, i) => acc + i.protein, 0) * 10) / 10;
    const totalC = Math.round(items.reduce((acc, i) => acc + i.carbs, 0) * 10) / 10;
    const totalF = Math.round(items.reduce((acc, i) => acc + i.fat, 0) * 10) / 10;

    const newCombo: SavedMealCombo = {
      id: "custom-combo-" + Date.now(),
      name: comboNameInput.trim() || "My Custom Combo",
      description: `Saved from ${activeMealTarget} with ${items.length} items`,
      tag: comboTagInput,
      calories: totalCal,
      protein: totalP,
      carbs: totalC,
      fat: totalF,
      items: items.map((i) => ({
        name: i.name,
        portionDisplay: `${i.quantity} ${i.unitLabel}`,
        calories: i.calories,
        protein: i.protein,
        carbs: i.carbs,
        fat: i.fat,
      })),
    };

    setSavedCombos((prev) => [newCombo, ...prev]);
    setIsSaveComboModalOpen(false);
    showToast(`⭐ Saved "${newCombo.name}" to your Combo Library!`);
  };

  // Combo Customization Handlers
  const handleOpenEditCombo = (combo: SavedMealCombo) => {
    setEditingCombo(JSON.parse(JSON.stringify(combo)));
    setIsComboFoodPickerOpen(false);
    setIsEditComboModalOpen(true);
  };

  const handleOpenCreateNewCombo = () => {
    const newTemplate: SavedMealCombo = {
      id: "combo-" + Date.now(),
      name: "My Custom Lifter Combo",
      description: "Custom meal combination",
      tag: "Custom",
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      items: [],
    };
    setEditingCombo(newTemplate);
    setIsComboFoodPickerOpen(false);
    setIsEditComboModalOpen(true);
  };

  const handleDeleteCombo = (comboId: string, comboName: string) => {
    setSavedCombos((prev) => prev.filter((c) => c.id !== comboId));
    showToast(`Deleted combo: "${comboName}"`);
  };

  const handleRemoveItemFromEditingCombo = (itemIndex: number) => {
    if (!editingCombo) return;
    const newItems = editingCombo.items.filter((_, idx) => idx !== itemIndex);
    const newCals = newItems.reduce((acc, i) => acc + i.calories, 0);
    const newP = Math.round(newItems.reduce((acc, i) => acc + i.protein, 0) * 10) / 10;
    const newC = Math.round(newItems.reduce((acc, i) => acc + i.carbs, 0) * 10) / 10;
    const newF = Math.round(newItems.reduce((acc, i) => acc + i.fat, 0) * 10) / 10;
    setEditingCombo({
      ...editingCombo,
      items: newItems,
      calories: newCals,
      protein: newP,
      carbs: newC,
      fat: newF,
    });
  };

  const handleAddItemToEditingCombo = (food: FoodDatabaseItem) => {
    if (!editingCombo) return;
    const grams = food.householdGrams * food.defaultQty;
    const factor = grams / 100;
    const cals = Math.round(food.calPer100g * factor);
    const p = Math.round(food.proteinPer100g * factor * 10) / 10;
    const c = Math.round(food.carbsPer100g * factor * 10) / 10;
    const f = Math.round(food.fatPer100g * factor * 10) / 10;

    const newItem = {
      name: food.name,
      portionDisplay: `${food.defaultQty} ${food.householdUnit} (~${grams}g)`,
      calories: cals,
      protein: p,
      carbs: c,
      fat: f,
    };

    const newItems = [...editingCombo.items, newItem];
    const newCals = newItems.reduce((acc, i) => acc + i.calories, 0);
    const newP = Math.round(newItems.reduce((acc, i) => acc + i.protein, 0) * 10) / 10;
    const newC = Math.round(newItems.reduce((acc, i) => acc + i.carbs, 0) * 10) / 10;
    const newF = Math.round(newItems.reduce((acc, i) => acc + i.fat, 0) * 10) / 10;

    setEditingCombo({
      ...editingCombo,
      items: newItems,
      calories: newCals,
      protein: newP,
      carbs: newC,
      fat: newF,
    });
    setIsComboFoodPickerOpen(false);
    showToast(`Added ${food.name} to combo`);
  };

  const handleSaveEditingCombo = () => {
    if (!editingCombo) return;
    if (editingCombo.items.length === 0) {
      showToast("Please add at least 1 food item to your combo");
      return;
    }
    const finalName = editingCombo.name.trim() || "Custom Combo";
    const updated = { ...editingCombo, name: finalName };

    setSavedCombos((prev) => {
      const idx = prev.findIndex((c) => c.id === updated.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    setIsEditComboModalOpen(false);
    showToast(`⭐ Combo "${finalName}" saved successfully!`);
  };

  // Filtered food items for search modal
  const filteredFoods = useMemo(() => {
    return INDIAN_FOOD_DATABASE.filter((food) => {
      const matchesSearch =
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategoryFilter === "All" ||
        food.category.toLowerCase() === selectedCategoryFilter.toLowerCase();
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategoryFilter]);

  // Categories list for meal slots
  const mealSlots: { id: MealCategory; label: string; icon: string; targetKcal: number }[] = [
    { id: "breakfast", label: "Breakfast", icon: "🍳", targetKcal: 500 },
    { id: "lunch", label: "Lunch", icon: "🍛", targetKcal: 700 },
    { id: "snacks", label: "Snacks / Post-Workout", icon: "🍎", targetKcal: 400 },
    { id: "dinner", label: "Dinner", icon: "🍗", targetKcal: 600 },
  ];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-[#09090b] w-full overflow-y-auto">
      {/* MODULE SUB-HEADER CONTROLS */}
      <div className="bg-[#141417] border-b border-[#27272a] px-3 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase tracking-wider">
            Module 4
          </span>
          <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
            <span>Indian Nutrition & Macro Studio</span>
          </h2>
          <span className="text-[11px] text-zinc-400 hidden md:inline">
            • Dual Units (Grams ↔ Roti/Katori) • ⚡ Quick Add • ⭐ 1-Tap Combos
          </span>
        </div>

        {/* Studio Sub-tabs */}
        <div className="flex items-center bg-[#09090b] p-1 rounded-xl border border-[#27272a] text-xs">
          <button
            onClick={() => setActiveSubTab("meals")}
            className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
              activeSubTab === "meals"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Daily Meals</span>
          </button>
          <button
            onClick={() => {
              setActiveMealTarget("lunch");
              setIsQuickAddModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg font-bold text-amber-400 hover:text-amber-300 transition flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">⚡ Quick Add</span>
          </button>
          <button
            onClick={() => {
              setActiveMealTarget("lunch");
              setIsCombosModalOpen(true);
            }}
            className="px-2.5 py-1.5 rounded-lg font-bold text-violet-400 hover:text-violet-300 transition flex items-center gap-1"
          >
            <Star className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">⭐ Combos ({savedCombos.length})</span>
          </button>
        </div>
      </div>

      {/* MAIN STUDIO WORKSPACE */}
      <div className="p-3 sm:p-5 space-y-4 max-w-5xl mx-auto w-full">
        {/* 1. TOP MACRO & CALORIE BUDGET DASHBOARD */}
        <div className="bg-[#141417] border border-[#27272a] rounded-3xl p-4 sm:p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Flame className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Daily Calorie & Macro Target
                </h3>
              </div>
              <p className="text-xs text-zinc-400">
                Target: <strong className="text-white">{CALORIE_GOAL.toLocaleString()} kcal</strong> • Consumed:{" "}
                <strong className="text-emerald-400">{totalCalories.toLocaleString()} kcal</strong>
              </p>
            </div>

            {/* Remaining Pill */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">Remaining</span>
                <span
                  className={`text-lg sm:text-xl font-extrabold font-mono ${
                    remainingCalories >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {remainingCalories >= 0
                    ? `${remainingCalories.toLocaleString()} kcal`
                    : `${Math.abs(remainingCalories).toLocaleString()} kcal over`}
                </span>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-700 flex flex-col items-center justify-center shrink-0">
                <span className="text-xs font-black text-emerald-400">
                  {Math.min(100, Math.round((totalCalories / CALORIE_GOAL) * 100))}%
                </span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase">Budget</span>
              </div>
            </div>
          </div>

          {/* Calorie Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  totalCalories > CALORIE_GOAL
                    ? "bg-rose-500"
                    : "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400"
                }`}
                style={{ width: `${Math.min(100, (totalCalories / CALORIE_GOAL) * 100)}%` }}
              />
            </div>
          </div>

          {/* 3 Macro Gauges */}
          <div
            className={
              isMobileSim
                ? "grid grid-cols-3 gap-2"
                : "grid grid-cols-1 sm:grid-cols-3 gap-3"
            }
          >
            {/* Protein Target (Lifter Focus) */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Protein</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  {remainingProtein}g left
                </span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-extrabold text-white font-mono">
                  {totalProtein} <span className="text-xs font-normal text-zinc-400">/ {PROTEIN_GOAL}g</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalProtein / PROTEIN_GOAL) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Carbs Target */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Carbs</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  {remainingCarbs}g left
                </span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-extrabold text-white font-mono">
                  {totalCarbs} <span className="text-xs font-normal text-zinc-400">/ {CARBS_GOAL}g</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalCarbs / CARBS_GOAL) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Fats Target */}
            <div className="bg-[#18181b] border border-[#27272a] rounded-2xl p-3 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span>Fats</span>
                </span>
                <span className="text-[10px] font-mono font-bold text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                  {remainingFat}g left
                </span>
              </div>
              <div>
                <div className="text-base sm:text-lg font-extrabold text-white font-mono">
                  {totalFat} <span className="text-xs font-normal text-zinc-400">/ {FAT_GOAL}g</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="h-full bg-rose-500 rounded-full transition-all"
                    style={{ width: `${Math.min(100, (totalFat / FAT_GOAL) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Water Hydration Bar */}
          <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-zinc-200">Hydration:</span>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {(waterMl / 1000).toFixed(2)}L / {(WATER_GOAL / 1000).toFixed(1)}L
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleAddWater(250)}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 text-xs font-bold hover:bg-cyan-900/60 active:scale-95 transition"
              >
                +250ml
              </button>
              <button
                onClick={() => handleAddWater(500)}
                className="px-2.5 py-1 rounded-lg bg-cyan-950/40 text-cyan-400 border border-cyan-800/60 text-xs font-bold hover:bg-cyan-900/60 active:scale-95 transition"
              >
                +500ml
              </button>
            </div>
          </div>
        </div>

        {/* 2. THE 4 MEAL SLOTS (Breakfast, Lunch, Snacks, Dinner) */}
        <div className="space-y-3.5">
          {mealSlots.map((slot) => {
            const sub = getMealSubtotal(slot.id);
            const items = loggedMeals[slot.id];

            return (
              <div
                key={slot.id}
                className="bg-[#141417] border border-[#27272a] rounded-3xl p-4 sm:p-5 shadow-lg space-y-3 transition-all"
              >
                {/* Meal Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{slot.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white">{slot.label}</h4>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Target: ~{slot.targetKcal} kcal
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        <strong className="text-emerald-400">{sub.cals} kcal</strong> •{" "}
                        <strong className="text-white">{sub.p}g Protein</strong> ({sub.count}{" "}
                        {sub.count === 1 ? "item" : "items"})
                      </p>
                    </div>
                  </div>

                  {/* Save as Combo Pill */}
                  {items.length > 0 && (
                    <button
                      onClick={() => handleSaveCurrentMealAsCombo(slot.id)}
                      className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-950/30 border border-violet-800/40 transition active:scale-95"
                      title="Save this meal as a 1-tap combo for later"
                    >
                      <Bookmark className="w-3 h-3" />
                      <span className="hidden sm:inline">Save Combo</span>
                    </button>
                  )}
                </div>

                {/* Logged Items List */}
                {items.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-[#18181b]/50 border border-dashed border-[#27272a] text-center text-xs text-zinc-500">
                    No foods logged yet for {slot.label.toLowerCase()}. Tap buttons below to add.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="p-3 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-zinc-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                      >
                        {/* Food Info & Dual Unit Portion Display */}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h5 className="text-xs font-bold text-white truncate">{item.name}</h5>
                            {item.isQuickAdd ? (
                              <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                                ⚡ Quick Add
                              </span>
                            ) : (
                              <span className="text-[9px] font-bold text-zinc-400 px-1.5 py-0.2 rounded bg-zinc-800 shrink-0">
                                {item.category}
                              </span>
                            )}
                          </div>

                          {/* Dual Unit Representation */}
                          <div className="text-[11px] text-zinc-400 flex flex-wrap items-center gap-2 mt-0.5">
                            <span className="font-semibold text-emerald-400">
                              {item.unitMode === "household"
                                ? `${item.quantity} ${item.unitLabel} (~${item.grams}g)`
                                : `${item.quantity}g (${(item.quantity / 35).toFixed(1)} portions)`}
                            </span>
                            <span>•</span>
                            <span className="font-mono text-zinc-300 font-bold">{item.calories} kcal</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">{item.protein}g P</span>
                            <span className="text-zinc-500 text-[10px]">
                              ({item.carbs}g C · {item.fat}g F)
                            </span>
                          </div>
                        </div>

                        {/* Item Quick Adjuster & Delete */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                          {!item.isQuickAdd && (
                            <div className="flex items-center gap-1 bg-zinc-900 px-1 py-0.5 rounded-lg border border-zinc-800">
                              <button
                                onClick={() => handleAdjustItemQuantity(slot.id, item.id, -1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800"
                              >
                                -
                              </button>
                              <span className="text-xs font-bold font-mono px-1 text-white">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleAdjustItemQuantity(slot.id, item.id, 1)}
                                className="w-5 h-5 rounded flex items-center justify-center text-xs font-bold text-zinc-400 hover:text-white hover:bg-zinc-800"
                              >
                                +
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => handleDeleteFoodItem(slot.id, item.id)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Remove food"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3 Action Buttons per Meal (Requirements 1, 2, 3, 4) */}
                <div
                  className={
                    isMobileSim
                      ? "grid grid-cols-3 gap-2 pt-1"
                      : "flex flex-wrap items-center gap-2 pt-1"
                  }
                >
                  {/* + Add Food Button */}
                  <button
                    onClick={() => handleOpenFoodModal(slot.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/30 transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add Food</span>
                  </button>

                  {/* ⚡ Quick Calorie Add (Requirement 3) */}
                  <button
                    onClick={() => handleOpenQuickAdd(slot.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-600 text-amber-300 hover:text-white text-xs font-bold border border-amber-500/30 transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>⚡ Quick Cal</span>
                  </button>

                  {/* ⭐ Saved Combos (Requirement 4) */}
                  <button
                    onClick={() => handleOpenCombos(slot.id)}
                    className="flex-1 py-2 px-3 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold border border-violet-500/30 transition flex items-center justify-center gap-1.5 active:scale-95"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>⭐ Combos</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RICH FOOD SEARCH & ADD MODAL (WITH DUAL UNIT CONVERTER)          */}
      {/* ========================================================================= */}
      {isFoodModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Add Food to</span>
                  <span className="capitalize px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-xs">
                    {activeMealTarget}
                  </span>
                </h3>
                <p className="text-[11px] text-zinc-400">
                  Search Indian staples, high-protein gym foods, or switch measuring units
                </p>
              </div>
              <button
                onClick={() => setIsFoodModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-3 border-b border-[#27272a] bg-[#18181b]/50 space-y-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Roti, Rice, Dal, Chicken, Paneer, Whey, Eggs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {[
                  "All",
                  "Indian Staples",
                  "High Protein",
                  "Dairy & Whey",
                  "Grains & Carbs",
                  "Snacks & Nuts",
                ].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                      selectedCategoryFilter === cat
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Food List */}
            <div className="p-3 overflow-y-auto space-y-2 max-h-56 border-b border-[#27272a]">
              {filteredFoods.length === 0 ? (
                <div className="text-center py-6 text-zinc-500 text-xs">No foods match your search.</div>
              ) : (
                filteredFoods.map((food) => {
                  const isSelected = selectedFood?.id === food.id;
                  return (
                    <div
                      key={food.id}
                      onClick={() => handleSelectFoodItem(food)}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-emerald-950/40 border-emerald-500 shadow-sm"
                          : "bg-[#18181b] border-[#27272a] hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white">{food.name}</h4>
                          {food.isIndian && (
                            <span className="text-[9px] font-bold text-amber-400">🇮🇳</span>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-400">
                          1 {food.householdUnit} (~{food.householdGrams}g) · {food.calPer100g} kcal/100g
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-emerald-400 block">
                          {Math.round(food.calPer100g * (food.householdGrams / 100))} kcal
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {Math.round(food.proteinPer100g * (food.householdGrams / 100) * 10) / 10}g P
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Selected Food Quantity & DUAL UNIT CONVERTER ENGINE (Requirement 2) */}
            {selectedFood && (
              <div className="p-4 bg-[#141417] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Selected Food</span>
                    <h4 className="text-xs font-bold text-white">{selectedFood.name}</h4>
                  </div>

                  {/* DUAL UNIT TOGGLE: Household Units <---> Kitchen Grams */}
                  <div className="flex items-center bg-[#09090b] p-1 rounded-xl border border-zinc-700">
                    <button
                      onClick={() => {
                        setUnitMode("household");
                        setQuantity(selectedFood.defaultQty);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                        unitMode === "household"
                          ? "bg-emerald-600 text-white shadow-sm"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>Household ({selectedFood.householdUnit})</span>
                    </button>
                    <button
                      onClick={() => {
                        setUnitMode("grams");
                        setQuantity(selectedFood.householdGrams * selectedFood.defaultQty);
                      }}
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
                </div>

                {/* Quantity Stepper & Gram Conversion Indicator */}
                <div className="flex items-center justify-between gap-3 bg-[#18181b] p-3 rounded-2xl border border-[#27272a]">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block">Serving Size</span>
                    <span className="text-xs text-emerald-400 font-semibold">
                      {unitMode === "household"
                        ? `${quantity} ${selectedFood.householdUnit} (~${calculatedMacros.grams} grams)`
                        : `${quantity}g on kitchen scale`}
                    </span>
                  </div>

                  {/* Stepper */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setQuantity((prev) =>
                          unitMode === "household"
                            ? Math.max(0.5, prev - 1)
                            : Math.max(10, prev - 25)
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center active:scale-95 transition"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-16 bg-[#09090b] border border-zinc-700 text-center font-bold text-white text-sm py-1 rounded-lg focus:outline-none"
                    />
                    <button
                      onClick={() =>
                        setQuantity((prev) =>
                          unitMode === "household" ? prev + 1 : prev + 25
                        )
                      }
                      className="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold flex items-center justify-center active:scale-95 transition"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Calculated Dynamic Macro Preview */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="bg-[#18181b] p-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-400 block">Calories</span>
                    <span className="text-sm font-extrabold text-white font-mono">
                      {calculatedMacros.cals}
                    </span>
                  </div>
                  <div className="bg-[#18181b] p-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-emerald-400 font-bold block">Protein</span>
                    <span className="text-sm font-extrabold text-emerald-400 font-mono">
                      {calculatedMacros.p}g
                    </span>
                  </div>
                  <div className="bg-[#18181b] p-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-amber-400 block">Carbs</span>
                    <span className="text-sm font-extrabold text-amber-400 font-mono">
                      {calculatedMacros.c}g
                    </span>
                  </div>
                  <div className="bg-[#18181b] p-2 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-rose-400 block">Fat</span>
                    <span className="text-sm font-extrabold text-rose-400 font-mono">
                      {calculatedMacros.f}g
                    </span>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={handleCommitFoodLog}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-98 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    Add to {activeMealTarget.toUpperCase()} (+{calculatedMacros.cals} kcal, +
                    {calculatedMacros.p}g Protein)
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: QUICK CALORIE ADD MODAL (REQUIREMENT 3: RESTAURANTS/CHEAT MEALS)   */}
      {/* ========================================================================= */}
      {isQuickAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-amber-500/20 text-amber-400">
                  <Zap className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Quick Calorie Add</h3>
                  <p className="text-[11px] text-zinc-400">
                    For restaurants, cheat meals, or estimated nutrition
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsQuickAddModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Destination Meal Selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Log into Meal:</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {mealSlots.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveMealTarget(m.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold transition capitalize ${
                        activeMealTarget === m.id
                          ? "bg-amber-600 text-white shadow-md shadow-amber-600/30"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Meal / Item Name (Optional):</label>
                <input
                  type="text"
                  placeholder="e.g. Chicken Biryani, Subway Sandwich, Late Night Snack"
                  value={quickAddName}
                  onChange={(e) => setQuickAddName(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quick Presets Pills (1-Tap) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300">1-Tap Quick Presets:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setQuickAddCalories(250);
                      setQuickAddProtein(12);
                      setQuickAddCarbs(25);
                      setQuickAddFat(8);
                    }}
                    className="p-2 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95"
                  >
                    <span className="text-xs font-bold text-white block">Light Snack</span>
                    <span className="text-[10px] text-amber-400 font-mono">+250 kcal · 12g P</span>
                  </button>

                  <button
                    onClick={() => {
                      setQuickAddCalories(500);
                      setQuickAddProtein(30);
                      setQuickAddCarbs(55);
                      setQuickAddFat(15);
                    }}
                    className="p-2 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95"
                  >
                    <span className="text-xs font-bold text-white block">Standard Meal</span>
                    <span className="text-[10px] text-amber-400 font-mono">+500 kcal · 30g P</span>
                  </button>

                  <button
                    onClick={() => {
                      setQuickAddCalories(750);
                      setQuickAddProtein(45);
                      setQuickAddCarbs(70);
                      setQuickAddFat(24);
                    }}
                    className="p-2 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95"
                  >
                    <span className="text-xs font-bold text-white block">Heavy Indian Feast</span>
                    <span className="text-[10px] text-amber-400 font-mono">+750 kcal · 45g P</span>
                  </button>

                  <button
                    onClick={() => {
                      setQuickAddCalories(1000);
                      setQuickAddProtein(50);
                      setQuickAddCarbs(110);
                      setQuickAddFat(35);
                    }}
                    className="p-2 rounded-xl bg-[#18181b] border border-zinc-800 hover:border-amber-500/50 text-left transition active:scale-95"
                  >
                    <span className="text-xs font-bold text-white block">Cheat Meal / Buffet</span>
                    <span className="text-[10px] text-amber-400 font-mono">+1,000 kcal · 50g P</span>
                  </button>
                </div>
              </div>

              {/* Exact Calories & Protein Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-300">Calories (kcal):</label>
                  <input
                    type="number"
                    value={quickAddCalories}
                    onChange={(e) => setQuickAddCalories(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-400">Protein (grams):</label>
                  <input
                    type="number"
                    value={quickAddProtein}
                    onChange={(e) => setQuickAddProtein(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Optional Carbs & Fat */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400">Carbs (g) (Optional):</label>
                  <input
                    type="number"
                    value={quickAddCarbs}
                    onChange={(e) => setQuickAddCarbs(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-400">Fat (g) (Optional):</label>
                  <input
                    type="number"
                    value={quickAddFat}
                    onChange={(e) => setQuickAddFat(Number(e.target.value))}
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs font-mono text-zinc-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Commit Button */}
              <button
                onClick={handleCommitQuickAdd}
                className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 flex items-center justify-center gap-1.5 active:scale-98 transition"
              >
                <Zap className="w-4 h-4" />
                <span>
                  Log {quickAddCalories} kcal to {activeMealTarget.toUpperCase()}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: 1-TAP SAVED COMBOS DRAWER (REQUIREMENT 4: REPEAT MEALS)          */}
      {/* ========================================================================= */}
      {isCombosModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[90vh]">
            {/* Header */}
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-violet-500/20 text-violet-400">
                  <Star className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">1-Tap Saved Combos</h3>
                  <p className="text-[11px] text-zinc-400">
                    Log your daily repeat meals with a single tap
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCombosModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Meal Selector & Action Bar */}
            <div className="p-3 bg-[#18181b]/50 border-b border-[#27272a] flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-zinc-300">Target Meal Slot:</span>
                <div className="flex items-center gap-1">
                  {mealSlots.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setActiveMealTarget(m.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition ${
                        activeMealTarget === m.id
                          ? "bg-violet-600 text-white shadow-sm"
                          : "bg-zinc-800 text-zinc-400 hover:text-white"
                      }`}
                    >
                      {m.label.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

              {/* + Create New Custom Combo Button */}
              <button
                onClick={handleOpenCreateNewCombo}
                className="px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white text-xs font-bold border border-violet-500/30 flex items-center gap-1.5 active:scale-95 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Create New Combo</span>
              </button>
            </div>

            {/* Combos List */}
            <div className="p-4 overflow-y-auto space-y-3 max-h-[60vh]">
              {savedCombos.map((combo) => (
                <div
                  key={combo.id}
                  className="p-3.5 rounded-2xl bg-[#18181b] border border-[#27272a] hover:border-violet-500/50 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{combo.name}</h4>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300">
                          {combo.tag}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400">{combo.description}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-emerald-400 block">
                          {combo.calories} kcal
                        </span>
                        <span className="text-[10px] text-white font-bold">{combo.protein}g Protein</span>
                      </div>

                      {/* Edit & Delete Combo Buttons */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEditCombo(combo);
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-violet-300 hover:bg-violet-500/20 transition"
                          title="Customize / Edit this combo"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCombo(combo.id, combo.name);
                          }}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/20 transition"
                          title="Delete combo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items Included */}
                  <div className="space-y-1 bg-[#141417] p-2 rounded-xl border border-zinc-800/80">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 block">Includes:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                      {combo.items.map((item, idx) => (
                        <div key={idx} className="text-[11px] text-zinc-300 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          <span className="font-semibold">{item.name}</span>
                          <span className="text-zinc-500">({item.portionDisplay})</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 1-Tap Log Button */}
                  <button
                    onClick={() => handleLogComboToMeal(combo)}
                    className="w-full py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 flex items-center justify-center gap-1.5 active:scale-98 transition"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>1-Tap Log All to {activeMealTarget.toUpperCase()}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: SAVE CURRENT MEAL AS REUSABLE COMBO                              */}
      {/* ========================================================================= */}
      {isSaveComboModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-slide-up">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-violet-400" />
                <span>Save {activeMealTarget.toUpperCase()} as Combo</span>
              </h3>
              <button
                onClick={() => setIsSaveComboModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Combo Name:</label>
                <input
                  type="text"
                  value={comboNameInput}
                  onChange={(e) => setComboNameInput(e.target.value)}
                  placeholder="e.g. My Favorite Post-Workout Lunch"
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-zinc-300">Tag / Category:</label>
                <select
                  value={comboTagInput}
                  onChange={(e) => setComboTagInput(e.target.value)}
                  className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="Daily Routine">Daily Routine</option>
                  <option value="High Protein">High Protein</option>
                  <option value="Post-Workout">Post-Workout</option>
                  <option value="Vegetarian">Vegetarian</option>
                  <option value="Clean Bulk">Clean Bulk</option>
                </select>
              </div>

              <div className="p-3 bg-[#18181b] rounded-xl border border-zinc-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                  Items to Save ({loggedMeals[activeMealTarget].length}):
                </span>
                {loggedMeals[activeMealTarget].map((i) => (
                  <div key={i.id} className="text-xs text-zinc-300 flex justify-between">
                    <span>
                      {i.name} ({i.quantity} {i.unitLabel})
                    </span>
                    <span className="font-mono text-zinc-400">{i.calories} kcal</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleCommitSaveCombo}
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 active:scale-98 transition"
              >
                Save to Combo Library
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: CUSTOMIZE / EDIT SAVED COMBO                                     */}
      {/* ========================================================================= */}
      {isEditComboModalOpen && editingCombo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden animate-slide-up max-h-[90vh]">
            <div className="p-4 border-b border-[#27272a] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-violet-500/20 text-violet-400">
                  <Edit3 className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Customize Combo</h3>
                  <p className="text-[11px] text-zinc-400">
                    Edit foods, portion sizes, or rename this combo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditComboModalOpen(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-3.5 max-h-[70vh]">
              {/* Combo Name & Tag */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Combo Name:</label>
                  <input
                    type="text"
                    value={editingCombo.name}
                    onChange={(e) =>
                      setEditingCombo({ ...editingCombo, name: e.target.value })
                    }
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500 font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-zinc-300">Tag:</label>
                  <select
                    value={editingCombo.tag}
                    onChange={(e) =>
                      setEditingCombo({ ...editingCombo, tag: e.target.value })
                    }
                    className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-violet-300 font-bold focus:outline-none"
                  >
                    <option value="Post-Workout">Post-Workout</option>
                    <option value="High Protein">High Protein</option>
                    <option value="Vegetarian">Vegetarian</option>
                    <option value="Clean Bulk">Clean Bulk</option>
                    <option value="Daily Routine">Daily Routine</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>

              {/* Combo Live Macros Summary */}
              <div className="grid grid-cols-4 gap-2 bg-[#18181b] p-2.5 rounded-2xl border border-zinc-800 text-center">
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">Calories</span>
                  <span className="text-xs font-black text-emerald-400 font-mono">
                    {editingCombo.calories} kcal
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">Protein</span>
                  <span className="text-xs font-black text-white font-mono">
                    {editingCombo.protein}g
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">Carbs</span>
                  <span className="text-xs font-black text-amber-400 font-mono">
                    {editingCombo.carbs}g
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 uppercase font-bold block">Fat</span>
                  <span className="text-xs font-black text-rose-400 font-mono">
                    {editingCombo.fat}g
                  </span>
                </div>
              </div>

              {/* Items in Combo List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-200">
                    Foods in this Combo ({editingCombo.items.length}):
                  </span>
                  <button
                    onClick={() => setIsComboFoodPickerOpen(!isComboFoodPickerOpen)}
                    className="text-[11px] font-bold text-violet-400 hover:text-violet-300 flex items-center gap-1 bg-violet-950/40 px-2.5 py-1 rounded-lg border border-violet-800/40"
                  >
                    <Plus className="w-3 h-3" />
                    <span>+ Add Food to Combo</span>
                  </button>
                </div>

                {/* Optional Embedded Food Picker when adding to combo */}
                {isComboFoodPickerOpen && (
                  <div className="p-3 bg-[#18181b] rounded-2xl border border-violet-500/40 space-y-2 animate-slide-up">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">Pick Food from Database:</span>
                      <button
                        onClick={() => setIsComboFoodPickerOpen(false)}
                        className="text-zinc-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Filter Indian & gym foods..."
                      value={comboFoodSearchQuery}
                      onChange={(e) => setComboFoodSearchQuery(e.target.value)}
                      className="w-full bg-[#09090b] border border-zinc-700 rounded-xl px-2.5 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none"
                    />
                    <div className="max-h-40 overflow-y-auto space-y-1.5 scrollbar-thin">
                      {INDIAN_FOOD_DATABASE.filter((f) =>
                        f.name.toLowerCase().includes(comboFoodSearchQuery.toLowerCase())
                      ).map((food) => (
                        <div
                          key={food.id}
                          onClick={() => handleAddItemToEditingCombo(food)}
                          className="p-2 rounded-xl bg-[#141417] border border-zinc-800 hover:border-violet-500/50 flex items-center justify-between cursor-pointer transition text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{food.name}</span>
                            <span className="text-[10px] text-zinc-400">
                              1 {food.householdUnit} (~{food.householdGrams}g)
                            </span>
                          </div>
                          <span className="text-[11px] font-bold text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-lg border border-violet-500/20">
                            + Add
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items rows */}
                {editingCombo.items.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#18181b]/40 border border-dashed border-zinc-800 text-center text-xs text-zinc-500">
                    No foods in this combo. Tap "+ Add Food to Combo" above.
                  </div>
                ) : (
                  editingCombo.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-[#18181b] border border-zinc-800 flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="text-xs font-bold text-white">{item.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          {item.portionDisplay} · {item.calories} kcal · {item.protein}g P
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemoveItemFromEditingCombo(idx)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Remove from combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-3 border-t border-[#27272a] bg-[#141417] flex items-center justify-end gap-2">
              <button
                onClick={() => setIsEditComboModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEditingCombo}
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold shadow-md shadow-violet-600/30 active:scale-95 transition"
              >
                Save Combo Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
