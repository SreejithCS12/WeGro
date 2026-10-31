import { Exercise, Food, WorkoutRoutine } from "@/types/database";

export const INITIAL_EXERCISES: Omit<Exercise, "created_at">[] = [
  // Chest
  { id: "ex-c1", name: "Barbell Bench Press", muscle_group: "Chest", equipment: "Barbell", exercise_type: "weight_reps", notes: "Target mid chest. Keep scapula retracted." },
  { id: "ex-c2", name: "Incline Dumbbell Press", muscle_group: "Chest", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "30-45 degree bench. Focus on upper chest." },
  { id: "ex-c3", name: "Decline Barbell Press", muscle_group: "Chest", equipment: "Barbell", exercise_type: "weight_reps", notes: "Target lower chest fibers." },
  { id: "ex-c4", name: "Cable Chest Flyes", muscle_group: "Chest", equipment: "Cable", exercise_type: "weight_reps", notes: "Squeeze at peak contraction." },
  { id: "ex-c5", name: "Dumbbell Chest Flyes", muscle_group: "Chest", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Flat bench flyes with slight elbow bend." },
  { id: "ex-c6", name: "Chest Dips", muscle_group: "Chest", equipment: "Bodyweight", exercise_type: "bodyweight_reps", notes: "Lean torso forward to hit chest." },
  { id: "ex-c7", name: "Push-Ups", muscle_group: "Chest", equipment: "Bodyweight", exercise_type: "bodyweight_reps", notes: "Standard bodyweight pushups." },
  { id: "ex-c8", name: "Pec Deck Machine", muscle_group: "Chest", equipment: "Machine", exercise_type: "weight_reps", notes: "Seated chest fly machine." },

  // Back
  { id: "ex-b1", name: "Conventional Deadlift", muscle_group: "Back", equipment: "Barbell", exercise_type: "weight_reps", notes: "Full posterior chain builder." },
  { id: "ex-b2", name: "Barbell Bent-Over Row", muscle_group: "Back", equipment: "Barbell", exercise_type: "weight_reps", notes: "Torso at 45 degrees, pull to lower ribcage." },
  { id: "ex-b3", name: "Lat Pulldown", muscle_group: "Back", equipment: "Cable", exercise_type: "weight_reps", notes: "Wide overhand grip down to clavicle." },
  { id: "ex-b4", name: "Seated Cable Row", muscle_group: "Back", equipment: "Cable", exercise_type: "weight_reps", notes: "Neutral close-grip handle to belly button." },
  { id: "ex-b5", name: "Pull-Ups", muscle_group: "Back", equipment: "Bodyweight", exercise_type: "bodyweight_reps", notes: "Wide overhand grip pull-ups." },
  { id: "ex-b6", name: "Chin-Ups", muscle_group: "Back", equipment: "Bodyweight", exercise_type: "bodyweight_reps", notes: "Underhand grip targeting lats and biceps." },
  { id: "ex-b7", name: "Single-Arm Dumbbell Row", muscle_group: "Back", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Keep spine neutral on flat bench." },
  { id: "ex-b8", name: "T-Bar Row", muscle_group: "Back", equipment: "Barbell", exercise_type: "weight_reps", notes: "Chest supported or landmine variation." },
  { id: "ex-b9", name: "Face Pulls", muscle_group: "Back", equipment: "Cable", exercise_type: "weight_reps", notes: "Rope to eye-level, external shoulder rotation." },

  // Legs
  { id: "ex-l1", name: "Barbell Back Squat", muscle_group: "Legs", equipment: "Barbell", exercise_type: "weight_reps", notes: "Deep squat to parallel or below." },
  { id: "ex-l2", name: "Barbell Front Squat", muscle_group: "Legs", equipment: "Barbell", exercise_type: "weight_reps", notes: "Quad dominant with vertical torso." },
  { id: "ex-l3", name: "Romanian Deadlift (RDL)", muscle_group: "Legs", equipment: "Barbell", exercise_type: "weight_reps", notes: "Hamstring hinge with soft knees." },
  { id: "ex-l4", name: "Leg Press", muscle_group: "Legs", equipment: "Machine", exercise_type: "weight_reps", notes: "45-degree sled leg press." },
  { id: "ex-l5", name: "Bulgarian Split Squat", muscle_group: "Legs", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Rear foot elevated on bench." },
  { id: "ex-l6", name: "Walking Lunges", muscle_group: "Legs", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Step forward keeping 90 deg knee angles." },
  { id: "ex-l7", name: "Leg Extension", muscle_group: "Legs", equipment: "Machine", exercise_type: "weight_reps", notes: "Strict quad isolation." },
  { id: "ex-l8", name: "Lying Hamstring Curl", muscle_group: "Legs", equipment: "Machine", exercise_type: "weight_reps", notes: "Prone hamstring curl machine." },
  { id: "ex-l9", name: "Standing Calf Raise", muscle_group: "Legs", equipment: "Machine", exercise_type: "weight_reps", notes: "Pause at top and bottom for calf stretch." },
  { id: "ex-l10", name: "Hip Thrust", muscle_group: "Legs", equipment: "Barbell", exercise_type: "weight_reps", notes: "Barbell across hips, squeeze glutes at top." },

  // Shoulders
  { id: "ex-s1", name: "Overhead Barbell Press (OHP)", muscle_group: "Shoulders", equipment: "Barbell", exercise_type: "weight_reps", notes: "Standing strict overhead military press." },
  { id: "ex-s2", name: "Seated Dumbbell Shoulder Press", muscle_group: "Shoulders", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "75-80 degree bench angle." },
  { id: "ex-s3", name: "Dumbbell Lateral Raise", muscle_group: "Shoulders", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Lead with elbows for side delt isolation." },
  { id: "ex-s4", name: "Cable Lateral Raise", muscle_group: "Shoulders", equipment: "Cable", exercise_type: "weight_reps", notes: "Constant tension across full ROM." },
  { id: "ex-s5", name: "Reverse Pec Deck", muscle_group: "Shoulders", equipment: "Machine", exercise_type: "weight_reps", notes: "Rear deltoid flyes." },
  { id: "ex-s6", name: "Dumbbell Shrugs", muscle_group: "Shoulders", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Trap elevation and hold for 1 sec." },

  // Arms
  { id: "ex-a1", name: "Barbell Bicep Curl", muscle_group: "Arms", equipment: "Barbell", exercise_type: "weight_reps", notes: "Standing straight or EZ bar curl." },
  { id: "ex-a2", name: "Dumbbell Hammer Curl", muscle_group: "Arms", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Neutral grip targeting brachialis." },
  { id: "ex-a3", name: "Incline Dumbbell Curl", muscle_group: "Arms", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Incline bench for deep bicep stretch." },
  { id: "ex-a4", name: "Tricep Rope Pushdown", muscle_group: "Arms", equipment: "Cable", exercise_type: "weight_reps", notes: "Spread rope at bottom of lockout." },
  { id: "ex-a5", name: "Skull Crushers", muscle_group: "Arms", equipment: "Barbell", exercise_type: "weight_reps", notes: "EZ bar lowered to crown of head." },
  { id: "ex-a6", name: "Overhead DB Tricep Extension", muscle_group: "Arms", equipment: "Dumbbell", exercise_type: "weight_reps", notes: "Two-handed dumbbell overhead." },
  { id: "ex-a7", name: "Close-Grip Bench Press", muscle_group: "Arms", equipment: "Barbell", exercise_type: "weight_reps", notes: "Shoulder-width grip for triceps." },

  // Core
  { id: "ex-co1", name: "Hanging Leg Raise", muscle_group: "Core", equipment: "Bodyweight", exercise_type: "bodyweight_reps", notes: "Raise legs to 90 degrees without swinging." },
  { id: "ex-co2", name: "Ab Wheel Rollout", muscle_group: "Core", equipment: "Other", exercise_type: "bodyweight_reps", notes: "Kneeling rollout with tucked pelvis." },
  { id: "ex-co3", name: "Plank", muscle_group: "Core", equipment: "Bodyweight", exercise_type: "bodyweight_reps", notes: "Isometric forearm hold." },
  { id: "ex-co4", name: "Cable Crunch", muscle_group: "Core", equipment: "Cable", exercise_type: "weight_reps", notes: "Kneeling rope crunch flexing abs." }
];

export const INITIAL_FOODS: Omit<Food, "created_at">[] = [
  // Grains & Breads
  { id: "f-g1", name: "Cooked White Rice", category: "Grains", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 130, protein: 2.7, carbohydrates: 28.2, fat: 0.3, notes: "Cooked basmati or sona masoori" },
  { id: "f-g2", name: "Cooked Brown Rice", category: "Grains", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 111, protein: 2.6, carbohydrates: 23.0, fat: 0.9, notes: "Boiled brown rice" },
  { id: "f-g3", name: "Roti / Wheat Chapati", category: "Bread", serving_description: "1 pc (35g)", reference_quantity: 35, reference_unit: "g", calories: 85, protein: 3.1, carbohydrates: 15.5, fat: 0.9, notes: "Plain homemade wheat roti without oil" },
  { id: "f-g4", name: "Roti with Ghee", category: "Bread", serving_description: "1 pc (40g)", reference_quantity: 40, reference_unit: "g", calories: 120, protein: 3.1, carbohydrates: 15.5, fat: 4.5, notes: "Brushed with 1/2 tsp ghee" },
  { id: "f-g5", name: "Rolled Oats (Raw)", category: "Grains", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 389, protein: 16.9, carbohydrates: 66.3, fat: 6.9, notes: "Uncooked whole rolled oats" },
  { id: "f-g6", name: "Whole Wheat Bread Slice", category: "Bread", serving_description: "1 slice (30g)", reference_quantity: 30, reference_unit: "g", calories: 75, protein: 3.5, carbohydrates: 13.0, fat: 1.0, notes: "Standard brown bread slice" },

  // Poultry, Meat & Eggs
  { id: "f-m1", name: "Chicken Breast (Cooked, Grilled)", category: "Chicken & Meat", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 165, protein: 31.0, carbohydrates: 0.0, fat: 3.6, notes: "Skinless boneless grilled breast" },
  { id: "f-m2", name: "Chicken Breast (Raw)", category: "Chicken & Meat", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 120, protein: 22.5, carbohydrates: 0.0, fat: 2.6, notes: "Raw boneless chicken breast" },
  { id: "f-m3", name: "Whole Egg (Boiled)", category: "Eggs", serving_description: "1 large (50g)", reference_quantity: 50, reference_unit: "g", calories: 78, protein: 6.3, carbohydrates: 0.6, fat: 5.3, notes: "Hard or soft boiled egg" },
  { id: "f-m4", name: "Egg White (Boiled)", category: "Eggs", serving_description: "1 white (33g)", reference_quantity: 33, reference_unit: "g", calories: 17, protein: 3.6, carbohydrates: 0.2, fat: 0.1, notes: "Boiled egg white only" },
  { id: "f-m5", name: "Canned Tuna in Water", category: "Fish", serving_description: "100g drained", reference_quantity: 100, reference_unit: "g", calories: 116, protein: 26.0, carbohydrates: 0.0, fat: 1.0, notes: "Light tuna chunk in spring water" },
  { id: "f-m6", name: "Salmon Fillet (Cooked)", category: "Fish", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 206, protein: 22.0, carbohydrates: 0.0, fat: 12.3, notes: "Pan seared Atlantic salmon" },

  // Dairy & Vegetarian Staples
  { id: "f-d1", name: "Paneer (Cottage Cheese)", category: "Dairy", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 265, protein: 18.3, carbohydrates: 4.2, fat: 20.8, notes: "Fresh cow milk paneer" },
  { id: "f-d2", name: "Low Fat Paneer", category: "Dairy", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 160, protein: 24.0, carbohydrates: 3.0, fat: 5.0, notes: "Skimmed milk cottage cheese" },
  { id: "f-d3", name: "Soya Chunks (Raw)", category: "Vegetarian Protein", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 345, protein: 52.0, carbohydrates: 33.0, fat: 0.5, notes: "Dry defatted soya chunks" },
  { id: "f-d4", name: "Tofu (Firm)", category: "Vegetarian Protein", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 144, protein: 15.5, carbohydrates: 3.0, fat: 8.5, notes: "Organic firm soy tofu" },
  { id: "f-d5", name: "Greek Yogurt (Plain, 0% Fat)", category: "Dairy", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 59, protein: 10.0, carbohydrates: 3.6, fat: 0.4, notes: "Strained curd" },
  { id: "f-d6", name: "Plain Curd / Dahi", category: "Dairy", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 61, protein: 3.5, carbohydrates: 4.7, fat: 3.3, notes: "Whole milk homemade dahi" },
  { id: "f-d7", name: "Cow Milk (Toned 3%)", category: "Dairy", serving_description: "100ml", reference_quantity: 100, reference_unit: "ml", calories: 58, protein: 3.2, carbohydrates: 4.7, fat: 3.0, notes: "Toned pasteurized milk" },
  { id: "f-d8", name: "Whey Protein Powder (1 Scoop)", category: "Supplements", serving_description: "1 scoop (30g)", reference_quantity: 30, reference_unit: "g", calories: 120, protein: 24.0, carbohydrates: 2.0, fat: 1.5, notes: "Whey Isolate or Concentrate" },

  // Indian Dishes & Pulses
  { id: "f-p1", name: "Dal Tadka (Cooked)", category: "Legumes", serving_description: "100g (1 bowl)", reference_quantity: 100, reference_unit: "g", calories: 110, protein: 5.5, carbohydrates: 14.0, fat: 3.5, notes: "Yellow lentils with cumin/ghee tempering" },
  { id: "f-p2", name: "Chana Masala (Chickpeas)", category: "Legumes", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 140, protein: 6.0, carbohydrates: 19.0, fat: 4.5, notes: "Spiced garbanzo curried" },
  { id: "f-p3", name: "Rajma (Kidney Beans)", category: "Legumes", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 125, protein: 5.5, carbohydrates: 18.0, fat: 3.2, notes: "Curried red kidney beans" },

  // Fruits, Vegetables & Nuts
  { id: "f-v1", name: "Banana", category: "Fruits", serving_description: "1 medium (118g)", reference_quantity: 118, reference_unit: "g", calories: 105, protein: 1.3, carbohydrates: 27.0, fat: 0.3, notes: "Fresh banana" },
  { id: "f-v2", name: "Apple", category: "Fruits", serving_description: "1 medium (180g)", reference_quantity: 180, reference_unit: "g", calories: 95, protein: 0.5, carbohydrates: 25.0, fat: 0.3, notes: "Fresh apple with peel" },
  { id: "f-v3", name: "Boiled Potato", category: "Vegetables", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 87, protein: 1.9, carbohydrates: 20.0, fat: 0.1, notes: "Plain boiled potato" },
  { id: "f-v4", name: "Sweet Potato (Cooked)", category: "Vegetables", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 86, protein: 1.6, carbohydrates: 20.1, fat: 0.1, notes: "Steamed sweet potato" },
  { id: "f-v5", name: "Steamed Broccoli", category: "Vegetables", serving_description: "100g", reference_quantity: 100, reference_unit: "g", calories: 35, protein: 2.4, carbohydrates: 7.2, fat: 0.4, notes: "Steamed green florets" },
  { id: "f-n1", name: "Peanut Butter (Natural)", category: "Nuts", serving_description: "1 tbsp (16g)", reference_quantity: 16, reference_unit: "g", calories: 95, protein: 4.0, carbohydrates: 3.2, fat: 8.0, notes: "100% roasted peanuts" },
  { id: "f-n2", name: "Almonds (Raw)", category: "Nuts", serving_description: "10 nuts (12g)", reference_quantity: 12, reference_unit: "g", calories: 70, protein: 2.5, carbohydrates: 2.5, fat: 6.0, notes: "Whole raw almonds" },
  { id: "f-n3", name: "Desi Ghee (Clarified Butter)", category: "Fats & Oils", serving_description: "1 tsp (5ml)", reference_quantity: 5, reference_unit: "ml", calories: 45, protein: 0.0, carbohydrates: 0.0, fat: 5.0, notes: "Pure cow ghee" },
  { id: "f-n4", name: "Olive Oil / Cooking Oil", category: "Fats & Oils", serving_description: "1 tsp (5ml)", reference_quantity: 5, reference_unit: "ml", calories: 44, protein: 0.0, carbohydrates: 0.0, fat: 5.0, notes: "Extra virgin olive oil" }
];

export const INITIAL_ROUTINES: WorkoutRoutine[] = [
  {
    id: "routine-chest-tricep",
    user_id: "default-user",
    name: "Chest & Triceps (Hypertrophy)",
    description: "Classic chest overload paired with tricep extension isolations.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: "re-ct-1", routine_id: "routine-chest-tricep", exercise_id: "ex-c1", order_index: 0, target_sets: 4, target_reps: "8-10", target_weight_kg: 60, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-ct-2", routine_id: "routine-chest-tricep", exercise_id: "ex-c2", order_index: 1, target_sets: 3, target_reps: "10-12", target_weight_kg: 24, rest_seconds: 75, created_at: new Date().toISOString() },
      { id: "re-ct-3", routine_id: "routine-chest-tricep", exercise_id: "ex-c4", order_index: 2, target_sets: 3, target_reps: "12-15", target_weight_kg: 15, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-ct-4", routine_id: "routine-chest-tricep", exercise_id: "ex-a4", order_index: 3, target_sets: 4, target_reps: "12-15", target_weight_kg: 25, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-ct-5", routine_id: "routine-chest-tricep", exercise_id: "ex-a5", order_index: 4, target_sets: 3, target_reps: "10-12", target_weight_kg: 20, rest_seconds: 60, created_at: new Date().toISOString() }
    ]
  },
  {
    id: "routine-back-bicep",
    user_id: "default-user",
    name: "Back & Biceps (Pull Split)",
    description: "Comprehensive lat width, upper back thickness, and bicep peaks.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: "re-bb-1", routine_id: "routine-back-bicep", exercise_id: "ex-b3", order_index: 0, target_sets: 4, target_reps: "8-10", target_weight_kg: 55, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-bb-2", routine_id: "routine-back-bicep", exercise_id: "ex-b4", order_index: 1, target_sets: 3, target_reps: "10-12", target_weight_kg: 50, rest_seconds: 75, created_at: new Date().toISOString() },
      { id: "re-bb-3", routine_id: "routine-back-bicep", exercise_id: "ex-b7", order_index: 2, target_sets: 3, target_reps: "10", target_weight_kg: 26, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-bb-4", routine_id: "routine-back-bicep", exercise_id: "ex-a1", order_index: 3, target_sets: 3, target_reps: "10-12", target_weight_kg: 25, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-bb-5", routine_id: "routine-back-bicep", exercise_id: "ex-a2", order_index: 4, target_sets: 3, target_reps: "12", target_weight_kg: 14, rest_seconds: 60, created_at: new Date().toISOString() }
    ]
  },
  {
    id: "routine-shoulders-arms",
    user_id: "default-user",
    name: "Shoulders & Abs (Delts Focus)",
    description: "Full 3D deltoid development paired with core flexion.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: "re-sa-1", routine_id: "routine-shoulders-arms", exercise_id: "ex-s1", order_index: 0, target_sets: 4, target_reps: "6-8", target_weight_kg: 40, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-sa-2", routine_id: "routine-shoulders-arms", exercise_id: "ex-s3", order_index: 1, target_sets: 4, target_reps: "12-15", target_weight_kg: 10, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-sa-3", routine_id: "routine-shoulders-arms", exercise_id: "ex-s5", order_index: 2, target_sets: 3, target_reps: "15", target_weight_kg: 35, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-sa-4", routine_id: "routine-shoulders-arms", exercise_id: "ex-co1", order_index: 3, target_sets: 3, target_reps: "15", target_weight_kg: 0, rest_seconds: 45, created_at: new Date().toISOString() }
    ]
  },
  {
    id: "routine-legs-calves",
    user_id: "default-user",
    name: "Legs & Calves (Lower Overload)",
    description: "Deep barbell squats, hamstring hinges, and calf stretch isolations.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: "re-lc-1", routine_id: "routine-legs-calves", exercise_id: "ex-l1", order_index: 0, target_sets: 4, target_reps: "6-8", target_weight_kg: 90, rest_seconds: 120, created_at: new Date().toISOString() },
      { id: "re-lc-2", routine_id: "routine-legs-calves", exercise_id: "ex-l3", order_index: 1, target_sets: 3, target_reps: "8-10", target_weight_kg: 80, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-lc-3", routine_id: "routine-legs-calves", exercise_id: "ex-l4", order_index: 2, target_sets: 3, target_reps: "10-12", target_weight_kg: 140, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-lc-4", routine_id: "routine-legs-calves", exercise_id: "ex-l9", order_index: 3, target_sets: 4, target_reps: "15", target_weight_kg: 45, rest_seconds: 60, created_at: new Date().toISOString() }
    ]
  },
  {
    id: "routine-push",
    user_id: "default-user",
    name: "Push Day (Chest, Shoulders, Triceps)",
    description: "Compound upper body push focusing on horizontal and vertical pressing.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: "re-1", routine_id: "routine-push", exercise_id: "ex-c1", order_index: 0, target_sets: 4, target_reps: "8-10", target_weight_kg: 60, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-2", routine_id: "routine-push", exercise_id: "ex-c2", order_index: 1, target_sets: 3, target_reps: "10-12", target_weight_kg: 24, rest_seconds: 75, created_at: new Date().toISOString() },
      { id: "re-3", routine_id: "routine-push", exercise_id: "ex-s3", order_index: 2, target_sets: 4, target_reps: "12-15", target_weight_kg: 10, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-4", routine_id: "routine-push", exercise_id: "ex-a4", order_index: 3, target_sets: 3, target_reps: "12-15", target_weight_kg: 25, rest_seconds: 60, created_at: new Date().toISOString() }
    ]
  },
  {
    id: "routine-pull",
    user_id: "default-user",
    name: "Pull Day (Back, Rear Delts, Biceps)",
    description: "Vertical and horizontal pulling session.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: "re-5", routine_id: "routine-pull", exercise_id: "ex-b1", order_index: 0, target_sets: 3, target_reps: "5", target_weight_kg: 100, rest_seconds: 180, created_at: new Date().toISOString() },
      { id: "re-6", routine_id: "routine-pull", exercise_id: "ex-b3", order_index: 1, target_sets: 4, target_reps: "8-10", target_weight_kg: 55, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-7", routine_id: "routine-pull", exercise_id: "ex-b9", order_index: 2, target_sets: 3, target_reps: "15", target_weight_kg: 20, rest_seconds: 60, created_at: new Date().toISOString() },
      { id: "re-8", routine_id: "routine-pull", exercise_id: "ex-a1", order_index: 3, target_sets: 3, target_reps: "10-12", target_weight_kg: 25, rest_seconds: 60, created_at: new Date().toISOString() }
    ]
  },
  {
    id: "routine-legs",
    user_id: "default-user",
    name: "Leg Day (Quads, Hamstrings, Calves)",
    description: "Lower body overload and hypertrophy.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    exercises: [
      { id: "re-9", routine_id: "routine-legs", exercise_id: "ex-l1", order_index: 0, target_sets: 4, target_reps: "6-8", target_weight_kg: 80, rest_seconds: 120, created_at: new Date().toISOString() },
      { id: "re-10", routine_id: "routine-legs", exercise_id: "ex-l3", order_index: 1, target_sets: 3, target_reps: "8-10", target_weight_kg: 70, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-11", routine_id: "routine-legs", exercise_id: "ex-l4", order_index: 2, target_sets: 3, target_reps: "12", target_weight_kg: 140, rest_seconds: 90, created_at: new Date().toISOString() },
      { id: "re-12", routine_id: "routine-legs", exercise_id: "ex-l9", order_index: 3, target_sets: 4, target_reps: "15", target_weight_kg: 40, rest_seconds: 45, created_at: new Date().toISOString() }
    ]
  }
];
