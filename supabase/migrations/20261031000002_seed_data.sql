-- ==============================================================================
-- PERSONAL FITNESS TRACKER — SEED DATA (EXERCISES & STAPLE FOODS)
-- Migration: 20261031000002_seed_data.sql
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. COMMON GYM EXERCISES (user_id IS NULL -> Global / System-level)
-- ------------------------------------------------------------------------------
INSERT INTO public.exercises (name, muscle_group, equipment, exercise_type, notes) VALUES
-- Chest
('Barbell Bench Press', 'Chest', 'Barbell', 'weight_reps', 'Standard flat bench press. Target mid chest.'),
('Incline Dumbbell Press', 'Chest', 'Dumbbell', 'weight_reps', '30-45 degree bench angle. Focus on upper chest.'),
('Decline Barbell Press', 'Chest', 'Barbell', 'weight_reps', 'Target lower pectoral muscle.'),
('Cable Chest Flyes', 'Chest', 'Cable', 'weight_reps', 'Mid-chest fly with peak squeeze at center.'),
('Dumbbell Chest Flyes', 'Chest', 'Dumbbell', 'weight_reps', 'Flat bench dumbbell flyes.'),
('Chest Dips', 'Chest', 'Bodyweight', 'bodyweight_reps', 'Slight forward lean to emphasize lower chest.'),
('Push-Ups', 'Chest', 'Bodyweight', 'bodyweight_reps', 'Standard bodyweight push-up.'),
('Pec Deck Machine', 'Chest', 'Machine', 'weight_reps', 'Seated chest fly machine.'),

-- Back
('Conventional Deadlift', 'Back', 'Barbell', 'weight_reps', 'Full posterior chain builder from the floor.'),
('Barbell Bent-Over Row', 'Back', 'Barbell', 'weight_reps', 'Overhand or underhand grip, 45 degree torso.'),
('Lat Pulldown', 'Back', 'Cable', 'weight_reps', 'Wide grip seated pulldown to upper chest.'),
('Seated Cable Row', 'Back', 'Cable', 'weight_reps', 'Neutral close-grip handle to lower abdomen.'),
('Pull-Ups', 'Back', 'Bodyweight', 'bodyweight_reps', 'Wide overhand grip pull-ups.'),
('Chin-Ups', 'Back', 'Bodyweight', 'bodyweight_reps', 'Underhand supinated grip, hits lats and biceps.'),
('Single-Arm Dumbbell Row', 'Back', 'Dumbbell', 'weight_reps', 'Supported on flat bench.'),
('T-Bar Row', 'Back', 'Barbell', 'weight_reps', 'Chest supported or landmine variation.'),
('Face Pulls', 'Back', 'Cable', 'weight_reps', 'Rope attachment at eye level, external rotation focus.'),

-- Legs
('Barbell Back Squat', 'Legs', 'Barbell', 'weight_reps', 'Deep squat below parallel.'),
('Barbell Front Squat', 'Legs', 'Barbell', 'weight_reps', 'Quad focused with upright torso.'),
('Romanian Deadlift (RDL)', 'Legs', 'Barbell', 'weight_reps', 'Hamstring and glute hinge with slight knee bend.'),
('Leg Press', 'Legs', 'Machine', 'weight_reps', '45-degree sled leg press.'),
('Bulgarian Split Squat', 'Legs', 'Dumbbell', 'weight_reps', 'Rear foot elevated on bench.'),
('Walking Lunges', 'Legs', 'Dumbbell', 'weight_reps', 'Dumbbells at side, step forward into lunge.'),
('Leg Extension', 'Legs', 'Machine', 'weight_reps', 'Seated quad isolation.'),
('Lying Hamstring Curl', 'Legs', 'Machine', 'weight_reps', 'Prone machine curl.'),
('Seated Hamstring Curl', 'Legs', 'Machine', 'weight_reps', 'Seated leg curl.'),
('Standing Calf Raise', 'Legs', 'Machine', 'weight_reps', 'Full extension and deep stretch on balls of feet.'),
('Seated Calf Raise', 'Legs', 'Machine', 'weight_reps', 'Soleus isolation.'),
('Hip Thrust', 'Legs', 'Barbell', 'weight_reps', 'Back supported on bench, barbell across hips.'),

-- Shoulders
('Overhead Barbell Press (OHP)', 'Shoulders', 'Barbell', 'weight_reps', 'Standing military press.'),
('Seated Dumbbell Shoulder Press', 'Shoulders', 'Dumbbell', 'weight_reps', 'Seated 80-degree bench press.'),
('Dumbbell Lateral Raise', 'Shoulders', 'Dumbbell', 'weight_reps', 'Slight lean, raise arms to 90 degrees for side delts.'),
('Cable Lateral Raise', 'Shoulders', 'Cable', 'weight_reps', 'Continuous tension lateral raise behind or in front.'),
('Reverse Pec Deck', 'Shoulders', 'Machine', 'weight_reps', 'Rear delt flyes.'),
('Dumbbell Front Raise', 'Shoulders', 'Dumbbell', 'weight_reps', 'Front deltoid isolation.'),
('Barbell Shrugs', 'Shoulders', 'Barbell', 'weight_reps', 'Trapezius elevation.'),

-- Arms
('Barbell Bicep Curl', 'Arms', 'Barbell', 'weight_reps', 'Standing straight bar or EZ-bar curl.'),
('Dumbbell Hammer Curl', 'Arms', 'Dumbbell', 'weight_reps', 'Neutral grip, targets brachialis and forearms.'),
('Incline Dumbbell Curl', 'Arms', 'Dumbbell', 'weight_reps', 'Incline bench for deep stretch on bicep long head.'),
('Preacher Curl', 'Arms', 'Machine', 'weight_reps', 'Strict arm support on preacher bench.'),
('Tricep Rope Pushdown', 'Arms', 'Cable', 'weight_reps', 'Spread rope at bottom for lateral head activation.'),
('Skull Crushers (Lying Tricep Ext)', 'Arms', 'Barbell', 'weight_reps', 'EZ-bar lowered to forehead/behind head.'),
('Overhead Dumbbell Tricep Extension', 'Arms', 'Dumbbell', 'weight_reps', 'Two-handed dumbbell lowered behind neck.'),
('Close-Grip Bench Press', 'Arms', 'Barbell', 'weight_reps', 'Shoulder-width grip, tricep overload.'),

-- Core
('Hanging Leg Raise', 'Core', 'Bodyweight', 'bodyweight_reps', 'Hang from bar, raise legs to 90 degrees or to bar.'),
('Ab Wheel Rollout', 'Core', 'Other', 'bodyweight_reps', 'Kneeling ab rollout maintaining posterior tilt.'),
('Plank', 'Core', 'Bodyweight', 'bodyweight_reps', 'Isometric core hold on forearms.'),
('Cable Crunch', 'Core', 'Cable', 'weight_reps', 'Kneeling rope cable crunch flexing spine.'),
('Russian Twists', 'Core', 'Bodyweight', 'bodyweight_reps', 'Seated rotational core exercise.')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 2. STAPLE FOODS & COMMON MEALS (user_id IS NULL -> Global / System-level)
-- Values normalized per 100g or standard unit
-- ------------------------------------------------------------------------------
INSERT INTO public.foods (name, category, serving_description, reference_quantity, reference_unit, calories, protein, carbohydrates, fat, notes) VALUES
-- Grains, Rice & Breads
('Cooked White Rice', 'Grains', '100g', 100, 'g', 130, 2.7, 28.2, 0.3, 'Standard boiled white basmati/sona masoori rice'),
('Cooked Brown Rice', 'Grains', '100g', 100, 'g', 111, 2.6, 23.0, 0.9, 'Cooked whole grain brown rice'),
('Roti / Whole Wheat Chapati', 'Bread', '1 piece (approx 35g)', 35, 'g', 85, 3.1, 15.5, 0.9, 'Standard homemade plain wheat roti without oil'),
('Roti with Ghee / Oil', 'Bread', '1 piece (approx 40g)', 40, 'g', 120, 3.1, 15.5, 4.5, 'Roti brushed with half teaspoon ghee'),
('Rolled Oats (Raw)', 'Grains', '100g', 100, 'g', 389, 16.9, 66.3, 6.9, 'Uncooked whole rolled oats'),
('Cooked Quinoa', 'Grains', '100g', 100, 'g', 120, 4.4, 21.3, 1.9, 'Cooked whole grain quinoa'),
('Whole Wheat Bread Slice', 'Bread', '1 slice (approx 30g)', 30, 'g', 75, 3.5, 13.0, 1.0, 'Standard brown bread slice'),

-- Poultry, Meat & Eggs
('Chicken Breast (Cooked, Grilled)', 'Chicken & Meat', '100g', 100, 'g', 165, 31.0, 0.0, 3.6, 'Skinless boneless grilled chicken breast'),
('Chicken Breast (Raw)', 'Chicken & Meat', '100g', 100, 'g', 120, 22.5, 0.0, 2.6, 'Raw boneless chicken breast'),
('Whole Egg (Boiled)', 'Eggs', '1 large egg (approx 50g)', 50, 'g', 78, 6.3, 0.6, 5.3, 'One whole large boiled egg'),
('Egg White (Boiled)', 'Eggs', '1 large egg white (approx 33g)', 33, 'g', 17, 3.6, 0.2, 0.1, 'Egg white only, no yolk'),
('Canned Tuna in Water', 'Fish', '100g drained', 100, 'g', 116, 26.0, 0.0, 1.0, 'Light tuna in spring water'),
('Salmon Fillet (Cooked)', 'Fish', '100g', 100, 'g', 206, 22.0, 0.0, 12.3, 'Atlantic salmon pan-seared'),

-- Dairy, Vegetarian Proteins & Indian Staples
('Paneer (Cottage Cheese)', 'Dairy', '100g', 100, 'g', 265, 18.3, 4.2, 20.8, 'Full-fat fresh cow milk paneer'),
('Low Fat Paneer', 'Dairy', '100g', 100, 'g', 160, 24.0, 3.0, 5.0, 'Skimmed milk cottage cheese'),
('Soya Chunks (Raw / Uncooked)', 'Vegetarian Protein', '100g', 100, 'g', 345, 52.0, 33.0, 0.5, 'Defatted soybean meal chunks'),
('Tofu (Firm)', 'Vegetarian Protein', '100g', 100, 'g', 144, 15.5, 3.0, 8.5, 'Organic firm soy tofu'),
('Greek Yogurt (Plain, 0% Fat)', 'Dairy', '100g', 100, 'g', 59, 10.0, 3.6, 0.4, 'Strained high-protein curd'),
('Plain Curd / Dahi (Homemade)', 'Dairy', '100g', 100, 'g', 61, 3.5, 4.7, 3.3, 'Whole milk plain dahi'),
('Cow Milk (Toned 3%)', 'Dairy', '100ml', 100, 'ml', 58, 3.2, 4.7, 3.0, 'Standard pasteurized toned milk'),
('Whey Protein Powder (1 Scoop)', 'Supplements', '1 scoop (30g)', 30, 'g', 120, 24.0, 2.0, 1.5, '100% Whey Isolate or Concentrate'),

-- Pulses, Legumes & Indian Dishes
('Cooked Dal Tadka (Yellow Lentils)', 'Legumes', '100g (approx 1 bowl)', 100, 'g', 110, 5.5, 14.0, 3.5, 'Toor or Moong dal with light ghee tempering'),
('Cooked Chana Masala (Chickpeas)', 'Legumes', '100g', 100, 'g', 140, 6.0, 19.0, 4.5, 'Curried garbanzo beans in tomato gravy'),
('Cooked Rajma (Kidney Beans)', 'Legumes', '100g', 100, 'g', 125, 5.5, 18.0, 3.2, 'North Indian style spiced kidney beans'),
('Moong Sprouts (Raw)', 'Vegetables', '100g', 100, 'g', 30, 3.0, 5.9, 0.2, 'Sprouted green gram'),

-- Fruits & Vegetables
('Banana', 'Fruits', '1 medium banana (approx 118g)', 118, 'g', 105, 1.3, 27.0, 0.3, 'Fresh ripe banana'),
('Apple', 'Fruits', '1 medium apple (approx 180g)', 180, 'g', 95, 0.5, 25.0, 0.3, 'Fresh apple with skin'),
('Boiled Potato', 'Vegetables', '100g', 100, 'g', 87, 1.9, 20.0, 0.1, 'Peeled boiled white potato'),
('Sweet Potato (Cooked)', 'Vegetables', '100g', 100, 'g', 86, 1.6, 20.1, 0.1, 'Boiled or baked sweet potato'),
('Steamed Broccoli', 'Vegetables', '100g', 100, 'g', 35, 2.4, 7.2, 0.4, 'Fresh steamed broccoli florets'),

-- Nuts, Fats & Oils
('Peanut Butter (Natural)', 'Nuts', '1 tablespoon (approx 16g)', 16, 'g', 95, 4.0, 3.2, 8.0, '100% roasted peanuts without added sugar/oil'),
('Almonds (Raw)', 'Nuts', '10 almonds (approx 12g)', 12, 'g', 70, 2.5, 2.5, 6.0, 'Whole raw almonds'),
('Olive Oil / Cooking Oil', 'Fats & Oils', '1 teaspoon (approx 5ml)', 5, 'ml', 44, 0.0, 0.0, 5.0, 'Pure extra virgin olive or vegetable oil'),
('Desi Ghee (Clarified Butter)', 'Fats & Oils', '1 teaspoon (approx 5ml)', 5, 'ml', 45, 0.0, 0.0, 5.0, 'Pure cow ghee')
ON CONFLICT DO NOTHING;
