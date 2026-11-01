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
-- ------------------------------------------------------------------------------
INSERT INTO public.foods (name, category, serving_description, reference_quantity, reference_unit, calories, protein, carbohydrates, fat, notes) VALUES
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,
,

ON CONFLICT DO NOTHING;
