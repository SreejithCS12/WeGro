export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type FitnessGoalType = "lose_weight" | "maintain_weight" | "gain_weight";
export type MealCategory = "breakfast" | "lunch" | "dinner" | "snacks";
export type WorkoutSessionStatus = "in_progress" | "completed" | "discarded";
export type WorkoutSetType = "normal" | "warmup" | "dropset" | "failure";
export type ExerciseType = "weight_reps" | "bodyweight_reps" | "assisted_bodyweight";
export type AppThemeColor = "purple" | "red" | "orange" | "blue" | "yellow";

export interface Profile {
  id: string;
  display_name: string;
  date_of_birth?: string | null;
  sex?: "male" | "female" | "other" | null;
  height_cm?: number | null;
  fitness_goal?: FitnessGoalType | null;
  activity_level?: string | null;
  preferred_units: string;
  timezone: string;
  latest_weight_kg?: number | null;
  theme_color?: AppThemeColor | null;
  created_at: string;
  updated_at: string;
}

export interface FitnessGoal {
  id: string;
  user_id: string;
  calorie_target: number;
  protein_grams: number;
  carbs_grams: number;
  fat_grams: number;
  water_ml: number;
  workouts_per_week: number;
  effective_from: string;
  effective_to?: string | null;
  created_at: string;
}

export interface Exercise {
  id: string;
  user_id?: string | null;
  name: string;
  muscle_group: string;
  equipment: string;
  exercise_type: ExerciseType;
  notes?: string | null;
  created_at: string;
}

export interface WorkoutRoutine {
  id: string;
  user_id: string;
  name: string;
  description?: string | null;
  created_at: string;
  updated_at: string;
  exercises?: RoutineExercise[];
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  order_index: number;
  target_sets: number;
  target_reps: string;
  target_weight_kg?: number | null;
  rest_seconds: number;
  notes?: string | null;
  created_at: string;
  exercise?: Exercise;
}

export interface WorkoutSchedule {
  id: string;
  user_id: string;
  day_of_week: number; // 0=Sunday, 1=Monday...
  routine_id?: string | null;
  created_at: string;
  routine?: WorkoutRoutine;
}

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id?: string | null;
  name: string;
  entry_date: string;
  status: WorkoutSessionStatus;
  started_at: string;
  completed_at?: string | null;
  duration_seconds?: number | null;
  notes?: string | null;
  created_at: string;
  sets?: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  reps: number;
  weight_kg: number;
  set_type: WorkoutSetType;
  is_completed: boolean;
  created_at: string;
  exercise?: Exercise;
}

export interface Food {
  id: string;
  user_id?: string | null;
  name: string;
  category?: string | null;
  serving_description: string;
  reference_quantity: number;
  reference_unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  notes?: string | null;
  created_at: string;
  household_unit?: string | null;
  household_grams?: number | null;
}

export interface SavedMeal {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  items?: SavedMealItem[];
}

export interface SavedMealItem {
  id: string;
  saved_meal_id: string;
  food_id: string;
  quantity: number;
  unit: string;
  created_at: string;
  food?: Food;
}

export interface FoodLog {
  id: string;
  user_id: string;
  entry_date: string;
  meal_category: MealCategory;
  food_id?: string | null;
  food_name_snapshot: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  notes?: string | null;
  created_at: string;
}

export interface WaterLog {
  id: string;
  user_id: string;
  entry_date: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
}

export interface BodyWeightLog {
  id: string;
  user_id: string;
  entry_date: string;
  weight_kg: number;
  notes?: string | null;
  created_at: string;
}

export interface BodyMeasurementLog {
  id: string;
  user_id: string;
  entry_date: string;
  waist_cm?: number | null;
  chest_cm?: number | null;
  arms_cm?: number | null;
  hips_cm?: number | null;
  thighs_cm?: number | null;
  notes?: string | null;
  created_at: string;
}
