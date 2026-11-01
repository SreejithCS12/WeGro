import { TrackerState } from "@/lib/services/tracker-store";

export type BadgeCategory = "streak" | "nutrition" | "iron" | "body";
export type BadgeTier = "bronze" | "silver" | "gold" | "platinum" | "diamond";

export interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  tier: BadgeTier;
  iconType:
    | "flame"
    | "zap"
    | "trophy"
    | "dumbbell"
    | "droplet"
    | "shield"
    | "scale"
    | "sparkles"
    | "utensils"
    | "target";
  currentValue: number;
  targetValue: number;
  unit: string;
  isUnlocked: boolean;
  unlockedAt?: string | null;
  progressPercent: number;
}

export interface MilestoneSummary {
  badges: MilestoneBadge[];
  unlockedCount: number;
  totalCount: number;
  totalVolumeKg: number;
  highestProteinGrams: number;
  completedWorkoutsCount: number;
  activeStreakDays: number;
}

export function calculateMilestoneBadges(
  state: TrackerState,
  activeStreak: number
): MilestoneSummary {
  const { foodLogs = [], waterLogs = [], sessions = [], weightLogs = [], measurementLogs = [], foods = [], goals = [] } = state;

  const currentGoal = goals[0] || { calorie_target: 2400, protein_grams: 160 };

  // 1. Calculate Total Workout Volume (sum of weight_kg * reps for completed sets in completed sessions)
  const completedSessions = sessions.filter((s) => s.status === "completed");
  let totalVolumeKg = 0;
  completedSessions.forEach((session) => {
    (session.sets || []).forEach((set) => {
      if (set.is_completed && set.weight_kg && set.reps) {
        totalVolumeKg += Number(set.weight_kg) * Number(set.reps);
      }
    });
  });
  totalVolumeKg = Math.round(totalVolumeKg);

  // 2. Nutrition Daily Aggregates (grouped by entry_date)
  const nutritionByDate: Record<
    string,
    { calories: number; protein: number; categories: Set<string> }
  > = {};

  foodLogs.forEach((f) => {
    if (!nutritionByDate[f.entry_date]) {
      nutritionByDate[f.entry_date] = { calories: 0, protein: 0, categories: new Set() };
    }
    nutritionByDate[f.entry_date].calories += Number(f.calories) || 0;
    nutritionByDate[f.entry_date].protein += Number(f.protein) || 0;
    if (f.meal_category) {
      nutritionByDate[f.entry_date].categories.add(f.meal_category);
    }
  });

  let maxProteinInDay = 0;
  let hasHitCalorieTarget = false;
  let hasLoggedAllFourMeals = false;

  Object.values(nutritionByDate).forEach((day) => {
    if (day.protein > maxProteinInDay) maxProteinInDay = day.protein;
    if (Math.abs(day.calories - currentGoal.calorie_target) <= 100 && day.calories > 0) {
      hasHitCalorieTarget = true;
    }
    if (
      day.categories.has("breakfast") &&
      day.categories.has("lunch") &&
      day.categories.has("dinner") &&
      day.categories.has("snack")
    ) {
      hasLoggedAllFourMeals = true;
    }
  });
  maxProteinInDay = Math.round(maxProteinInDay);

  // 3. Hydration Aggregates (grouped by entry_date)
  const waterByDate: Record<string, number> = {};
  waterLogs.forEach((w) => {
    waterByDate[w.entry_date] = (waterByDate[w.entry_date] || 0) + Number(w.amount_ml);
  });
  const maxWaterInDay = Math.max(0, ...Object.values(waterByDate));

  // 4. Custom Food count (foods created by user)
  const customFoodCount = foods.filter(
    (f) => Boolean(f.user_id) || f.category === "Packaged Food" || f.category === "Custom Recipe"
  ).length;

  // 5. Unique weight logging days
  const uniqueWeightDays = new Set(weightLogs.map((w) => w.entry_date)).size;

  // 6. Body measurements count
  const measurementsCount = measurementLogs.length;

  // Helper to construct badge
  const createBadge = (
    id: string,
    title: string,
    description: string,
    category: BadgeCategory,
    tier: BadgeTier,
    iconType: MilestoneBadge["iconType"],
    currentVal: number,
    targetVal: number,
    unit: string
  ): MilestoneBadge => {
    const isUnlocked = currentVal >= targetVal;
    const progressPercent = Math.min(100, Math.round((currentVal / targetVal) * 100));
    return {
      id,
      title,
      description,
      category,
      tier,
      iconType,
      currentValue: currentVal,
      targetValue: targetVal,
      unit,
      isUnlocked,
      progressPercent,
    };
  };

  const badges: MilestoneBadge[] = [
    // Streak Milestones
    createBadge(
      "streak-3",
      "Ignition Spark",
      "Log workouts or nutrition for 3 consecutive days",
      "streak",
      "bronze",
      "zap",
      activeStreak,
      3,
      "days"
    ),
    createBadge(
      "streak-7",
      "7-Day Warrior",
      "Maintain a 7-day continuous consistency streak",
      "streak",
      "silver",
      "flame",
      activeStreak,
      7,
      "days"
    ),
    createBadge(
      "streak-14",
      "Two-Week Iron",
      "Unbroken discipline for 14 straight days",
      "streak",
      "gold",
      "flame",
      activeStreak,
      14,
      "days"
    ),
    createBadge(
      "streak-30",
      "Discipline Elite",
      "Achieve 30 consecutive days of tracking",
      "streak",
      "platinum",
      "shield",
      activeStreak,
      30,
      "days"
    ),
    createBadge(
      "streak-100",
      "Century Legend",
      "100 days of active consistency",
      "streak",
      "diamond",
      "trophy",
      activeStreak,
      100,
      "days"
    ),

    // Nutrition & Fuel Milestones
    createBadge(
      "protein-100",
      "100g Protein Club",
      "Hit 100g or more of dietary protein in a single day",
      "nutrition",
      "bronze",
      "target",
      maxProteinInDay,
      100,
      "g"
    ),
    createBadge(
      "protein-150",
      "Anabolic Machine",
      "Hit 150g or more of protein in a single day",
      "nutrition",
      "gold",
      "sparkles",
      maxProteinInDay,
      150,
      "g"
    ),
    createBadge(
      "macro-target",
      "Macro Sniper",
      "Finish a day within ±100 kcal of your calorie target",
      "nutrition",
      "silver",
      "target",
      hasHitCalorieTarget ? 1 : 0,
      1,
      "day"
    ),
    createBadge(
      "hydro-3l",
      "Hydro Titan",
      "Hydrate with 3,000ml or more of water in a single day",
      "nutrition",
      "silver",
      "droplet",
      maxWaterInDay,
      3000,
      "ml"
    ),
    createBadge(
      "four-meals",
      "Full Spectrum",
      "Log Breakfast, Lunch, Dinner, and Snacks in one day",
      "nutrition",
      "bronze",
      "utensils",
      hasLoggedAllFourMeals ? 1 : 0,
      1,
      "day"
    ),
    createBadge(
      "custom-recipe",
      "Custom Pantry",
      "Create and save a custom food or recipe to your database",
      "nutrition",
      "bronze",
      "sparkles",
      customFoodCount,
      1,
      "item"
    ),

    // Iron & Volume Milestones
    createBadge(
      "workout-1",
      "First Iron Blood",
      "Complete your very first logged workout session",
      "iron",
      "bronze",
      "dumbbell",
      completedSessions.length,
      1,
      "sessions"
    ),
    createBadge(
      "workout-5",
      "High Five",
      "Complete 5 full workout sessions",
      "iron",
      "bronze",
      "dumbbell",
      completedSessions.length,
      5,
      "sessions"
    ),
    createBadge(
      "workout-10",
      "Iron Regular",
      "Complete 10 full workout sessions",
      "iron",
      "silver",
      "dumbbell",
      completedSessions.length,
      10,
      "sessions"
    ),
    createBadge(
      "workout-25",
      "Quarter Century",
      "Complete 25 workout sessions",
      "iron",
      "gold",
      "trophy",
      completedSessions.length,
      25,
      "sessions"
    ),
    createBadge(
      "volume-1k",
      "1-Ton Club",
      "Move 1,000 kg total cumulative workout volume",
      "iron",
      "bronze",
      "shield",
      totalVolumeKg,
      1000,
      "kg"
    ),
    createBadge(
      "volume-10k",
      "10-Ton Mover",
      "Move 10,000 kg total cumulative workout volume",
      "iron",
      "gold",
      "shield",
      totalVolumeKg,
      10000,
      "kg"
    ),
    createBadge(
      "volume-50k",
      "50-Ton Freight Train",
      "Move 50,000 kg total cumulative volume in the gym",
      "iron",
      "platinum",
      "trophy",
      totalVolumeKg,
      50000,
      "kg"
    ),
    createBadge(
      "volume-100k",
      "Century Titan",
      "Move 100,000 kg total cumulative volume",
      "iron",
      "diamond",
      "trophy",
      totalVolumeKg,
      100000,
      "kg"
    ),

    // Body Evolution Milestones
    createBadge(
      "weight-logged",
      "Accountability",
      "Log your body weight for the first time",
      "body",
      "bronze",
      "scale",
      weightLogs.length,
      1,
      "weigh-in"
    ),
    createBadge(
      "weight-logs-5",
      "True Trajectory",
      "Log body weight across 5 separate days",
      "body",
      "silver",
      "scale",
      uniqueWeightDays,
      5,
      "days"
    ),
    createBadge(
      "tape-measure",
      "Tale of the Tape",
      "Record circumference body measurements",
      "body",
      "bronze",
      "target",
      measurementsCount,
      1,
      "entry"
    ),
  ];

  const unlockedCount = badges.filter((b) => b.isUnlocked).length;

  return {
    badges,
    unlockedCount,
    totalCount: badges.length,
    totalVolumeKg,
    highestProteinGrams: maxProteinInDay,
    completedWorkoutsCount: completedSessions.length,
    activeStreakDays: activeStreak,
  };
}
