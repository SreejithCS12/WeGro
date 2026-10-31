import { FitnessGoalType } from "@/types/database";

export interface SuggestionParams {
  weightKg: number;
  heightCm: number;
  sex: "male" | "female" | "other";
  age?: number;
  goal: FitnessGoalType;
  activityLevel: "sedentary" | "light" | "moderate" | "active";
}

export interface SuggestedTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
}

export function calculateMacroSuggestions({
  weightKg,
  heightCm,
  sex,
  age = 26,
  goal,
  activityLevel,
}: SuggestionParams): SuggestedTargets {
  // 1. Basal Metabolic Rate (BMR) via Mifflin-St Jeor
  let bmr: number;
  if (sex === "female") {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  } else {
    // Default to male formula
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  }

  // 2. Activity Multiplier
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55, // 3-5 days gym
    active: 1.725,  // 6-7 days gym
  };
  const multiplier = multipliers[activityLevel] || 1.55;
  const tdee = bmr * multiplier;

  // 3. Goal Calorie Adjustment
  let targetCalories: number;
  if (goal === "lose_weight") {
    targetCalories = Math.round(tdee - 450); // Moderate deficit
  } else if (goal === "gain_weight") {
    targetCalories = Math.round(tdee + 300); // Clean bulk surplus
  } else {
    targetCalories = Math.round(tdee);       // Maintenance
  }

  // Floor safety minimums
  const minCalories = sex === "female" ? 1400 : 1600;
  targetCalories = Math.max(minCalories, targetCalories);

  // 4. Protein: 2.0g per kg of bodyweight
  const protein = Math.round(weightKg * 2.0);
  const proteinKcal = protein * 4;

  // 5. Fat: 0.9g per kg of bodyweight
  const fat = Math.round(weightKg * 0.9);
  const fatKcal = fat * 9;

  // 6. Carbohydrates: Remaining calories / 4
  const remainingKcal = Math.max(0, targetCalories - (proteinKcal + fatKcal));
  const carbs = Math.round(remainingKcal / 4);

  // 7. Water: 35ml per kg + 500ml gym allowance, rounded to nearest 250ml
  const rawWater = weightKg * 35 + 500;
  const waterMl = Math.max(2500, Math.round(rawWater / 250) * 250);

  return {
    calories: targetCalories,
    protein,
    carbs,
    fat,
    waterMl,
  };
}
