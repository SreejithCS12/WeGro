"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/navigation/Header";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";
import { BottomNav, NavTab } from "@/components/navigation/BottomNav";
import { EnergyCard } from "@/components/dashboard/EnergyCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { HydrationCard } from "@/components/dashboard/HydrationCard";
import { WorkoutTodayCard } from "@/components/dashboard/WorkoutTodayCard";
import { MealsCard } from "@/components/dashboard/MealsCard";
import { AddFoodModal } from "@/components/modals/AddFoodModal";
import { AddWaterModal } from "@/components/modals/AddWaterModal";
import { RecordWeightModal } from "@/components/modals/RecordWeightModal";
import { CopyMealsModal } from "@/components/modals/CopyMealsModal";
import { CreateRoutineModal } from "@/components/modals/CreateRoutineModal";
import { AuthModal } from "@/components/auth/AuthModal";
import { AuthView } from "@/components/auth/AuthView";
import { ShareDayModal } from "@/components/modals/ShareDayModal";
import { PWAInstallPrompt } from "@/components/ui/PWAInstallPrompt";
import { SplashScreen } from "@/components/ui/SplashScreen";
import { LandingPage } from "@/components/landing/LandingPage";
import { WorkoutView } from "@/components/workout/WorkoutView";
import { ActiveWorkoutView } from "@/components/workout/ActiveWorkoutView";
import { NutritionView } from "@/components/nutrition/NutritionView";
import { ProgressView } from "@/components/progress/ProgressView";
import { SettingsView } from "@/components/settings/SettingsView";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";
import { useTrackerStore } from "@/lib/services/tracker-store";
import { formatDateToISO, calculateActiveStreak, scrollToTop } from "@/lib/utils";
import { calculateMilestoneBadges } from "@/lib/data/badges";
import { MealCategory } from "@/types/database";
import { applyTheme, getStoredTheme } from "@/lib/theme";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const store = useTrackerStore();
  const [currentDate, setCurrentDate] = useState<string>(formatDateToISO(new Date()));
  const [currentTab, setCurrentTab] = useState<NavTab>("dashboard");

  // Modals state
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [foodModalCategory, setFoodModalCategory] = useState<MealCategory>("lunch");
  const [foodModalMode, setFoodModalMode] = useState<"library" | "quickAdd" | "scan">("library");
  const [isAddWaterOpen, setIsAddWaterOpen] = useState(false);
  const [isRecordWeightOpen, setIsRecordWeightOpen] = useState(false);
  const [isCopyMealsOpen, setIsCopyMealsOpen] = useState(false);
  const [isCreateRoutineOpen, setIsCreateRoutineOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Unauthenticated view state (Landing Page vs Login / Sign Up)
  const [unauthMode, setUnauthMode] = useState<"landing" | "auth">("landing");
  const [authTab, setAuthTab] = useState<"signin" | "signup">("signup");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Minimalist Luxury Splash Screen Launch State
  const [showSplash, setShowSplash] = useState(true);
  const [isSplashFadingOut, setIsSplashFadingOut] = useState(false);

  // Check URL parameters / hash on mount (e.g. #signin, #signup, type=recovery)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash || "";
      const search = window.location.search || "";

      if (hash.includes("type=recovery")) {
        setIsPasswordRecovery(true);
        return;
      }

      if (
        hash.includes("auth") ||
        hash.includes("signin") ||
        hash.includes("signup") ||
        search.includes("auth") ||
        search.includes("signin") ||
        search.includes("signup")
      ) {
        setUnauthMode("auth");
        if (hash.includes("signin") || search.includes("signin")) {
          setAuthTab("signin");
        } else {
          setAuthTab("signup");
        }
      }
    }

    const supabase = createClient();
    if (!supabase) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsPasswordRecovery(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (store.isLoaded) {
      const timer = setTimeout(() => {
        setIsSplashFadingOut(true);
        const unmountTimer = setTimeout(() => {
          setShowSplash(false);
        }, 500);
        return () => clearTimeout(unmountTimer);
      }, 850);
      return () => clearTimeout(timer);
    }
  }, [store.isLoaded]);

  useEffect(() => {
    if (store.isLoaded) {
      const activeTheme = store.state.profile?.theme_color || getStoredTheme();
      applyTheme(activeTheme);
    }
  }, [store.isLoaded, store.state.profile?.theme_color]);

  // Scroll view back to top whenever navigation tab changes
  useEffect(() => {
    scrollToTop(false);
    const rafId = requestAnimationFrame(() => {
      scrollToTop(false);
    });
    return () => cancelAnimationFrame(rafId);
  }, [currentTab]);

  if (!store.isLoaded) {
    return <SplashScreen isFadingOut={false} />;
  }

  // Priority: If user clicked a password reset link, show the Create New Password view
  if (isPasswordRecovery) {
    return (
      <>
        {showSplash && <SplashScreen isFadingOut={isSplashFadingOut} />}
        <AuthView
          defaultTab="reset"
          onSuccess={() => {
            setIsPasswordRecovery(false);
            if (typeof window !== "undefined") {
              window.location.hash = "";
            }
          }}
        />
      </>
    );
  }

  // 1. If not logged in, show Landing Page or Login / Sign Up screen
  if (!store.authUser) {
    return (
      <>
        {showSplash && <SplashScreen isFadingOut={isSplashFadingOut} />}
        {unauthMode === "landing" ? (
          <LandingPage
            onGetStarted={() => {
              setAuthTab("signup");
              setUnauthMode("auth");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSignIn={() => {
              setAuthTab("signin");
              setUnauthMode("auth");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        ) : (
          <AuthView
            defaultTab={authTab}
            onBackToLanding={() => {
              setUnauthMode("landing");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onSuccess={() => {}}
          />
        )}
      </>
    );
  }

  // 2. If logged in, but has not completed onboarding yet, show Onboarding Wizard
  if (!store.hasCompletedOnboarding) {
    return (
      <>
        {showSplash && <SplashScreen isFadingOut={isSplashFadingOut} />}
        <OnboardingWizard
          onComplete={store.completeOnboarding}
          initialProfile={store.state.profile}
          initialGoal={store.state.goals[0]}
          userEmail={store.authUser?.email}
          onSignOut={store.signOut}
        />
      </>
    );
  }

  const dailyTotals = store.getDailyTotals(currentDate);
  const dayFoodLogs = store.state.foodLogs.filter((f) => f.entry_date === currentDate);
  const dayWaterLogs = store.state.waterLogs.filter((w) => w.entry_date === currentDate);
  const completedSessions = store.state.sessions.filter((s) => s.status === "completed");

  // Calculate active daily consistency streak
  const activityDates = (() => {
    const dates = new Set<string>();
    store.state.foodLogs.forEach((f) => dates.add(f.entry_date));
    store.state.sessions.forEach((s) => {
      if (s.status === "completed") dates.add(s.entry_date);
    });
    store.state.waterLogs.forEach((w) => dates.add(w.entry_date));
    return Array.from(dates);
  })();

  const streakDays = calculateActiveStreak(activityDates, currentDate);
  const milestoneSummary = calculateMilestoneBadges(store.state, streakDays);

  // Compute yesterday for quick meals copying
  const [yearNum, monthNum, dayNum] = currentDate.split("-").map(Number);
  const prevDateObj = new Date(yearNum, monthNum - 1, dayNum);
  prevDateObj.setDate(prevDateObj.getDate() - 1);
  const yesterdayDate = formatDateToISO(prevDateObj);
  const yesterdayFoodLogs = store.state.foodLogs.filter((f) => f.entry_date === yesterdayDate);

  const handleOpenAddFood = (
    category: MealCategory = "lunch",
    mode: "library" | "quickAdd" | "scan" = "library"
  ) => {
    setFoodModalCategory(category);
    setFoodModalMode(mode);
    setIsAddFoodOpen(true);
  };

  const [currentYear, currentMonth, currentDay] = currentDate.split("-").map(Number);
  const currentDayIndex = new Date(currentYear, currentMonth - 1, currentDay).getDay();
  const scheduledRoutineId = store.state.weeklySchedule?.[currentDayIndex];
  const todayRoutine = store.state.routines.find((r) => r.id === scheduledRoutineId);
  const isScheduleRestDay = scheduledRoutineId === null || scheduledRoutineId === undefined;
  const effectiveIsRestDay = dailyTotals.isRestDay || isScheduleRestDay;
  const todayRoutineName = isScheduleRestDay
    ? "Rest Day"
    : todayRoutine?.name || "Resistance Training";

  const handleTabChange = (tab: NavTab) => {
    if (tab === currentTab) {
      scrollToTop(true);
    } else {
      setCurrentTab(tab);
      scrollToTop(false);
    }
  };

  const handleStartWorkout = (
    routineId?: string,
    customName?: string,
    customExercises?: Array<{
      exercise_id: string;
      target_sets: number;
      target_reps: string;
      target_weight_kg?: number | null;
    }>
  ) => {
    store.startWorkout(routineId, customName, customExercises);
    handleTabChange("workouts");
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex font-sans selection:bg-purple-500/30">
      {/* Animated Minimalist Splash Overlay during launch */}
      {showSplash && <SplashScreen isFadingOut={isSplashFadingOut} />}

      {/* Desktop Left Sidebar (Only visible on lg+ screens) */}
      <DesktopSidebar
        currentTab={currentTab}
        onTabChange={handleTabChange}
        hasActiveWorkout={Boolean(store.activeWorkout)}
        userName={store.state.profile.display_name}
        calorieTarget={dailyTotals.goal.calorie_target}
        onStartWorkout={() => handleStartWorkout()}
        authUser={store.authUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onSignOut={store.signOut}
        syncQueueState={store.syncQueueState}
        onTriggerSyncNow={store.triggerSyncNow}
      />

      {/* Main App Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-clip">
        {/* Top Header */}
        <Header
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          userName={store.state.profile.display_name}
          onOpenProfile={() => handleTabChange("settings")}
          currentTab={currentTab}
          onTabChange={handleTabChange}
          hasActiveWorkout={Boolean(store.activeWorkout)}
          onQuickAddFood={() => handleOpenAddFood("lunch")}
          onQuickAddWater={() => store.addWater(currentDate, 250)}
          onQuickStartWorkout={() => handleStartWorkout()}
          authUser={store.authUser}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenShare={() => setIsShareModalOpen(true)}
          syncQueueState={store.syncQueueState}
          onTriggerSyncNow={store.triggerSyncNow}
        />

        {/* Main Scrollable View */}
        <main className="flex-1 w-full max-w-lg md:max-w-4xl lg:max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-4 md:py-6 pb-32">
          {/* Tab 1: Dashboard */}
          {currentTab === "dashboard" && (
            <div>
              {/* MOBILE LAYOUT (< md): 100% UNTOUCHED ORIGINAL SINGLE COLUMN */}
              <div className="md:hidden space-y-4 pb-20 animate-fade-in">
                {/* Calorie & Macronutrient Summary */}
                <EnergyCard
                  calorieTarget={dailyTotals.goal.calorie_target}
                  caloriesConsumed={dailyTotals.caloriesConsumed}
                  proteinTarget={dailyTotals.goal.protein_grams}
                  proteinConsumed={dailyTotals.proteinConsumed}
                  carbsTarget={dailyTotals.goal.carbs_grams}
                  carbsConsumed={dailyTotals.carbsConsumed}
                  fatTarget={dailyTotals.goal.fat_grams}
                  fatConsumed={dailyTotals.fatConsumed}
                />

                {/* Quick Actions */}
                <QuickActions
                  onAddFood={() => handleOpenAddFood("lunch")}
                  onAddWater={() => store.addWater(currentDate, 250)}
                  onStartWorkout={() => handleStartWorkout()}
                  onLogWeight={() => setIsRecordWeightOpen(true)}
                />

                {/* Workout Card (Shows active session or start CTA) */}
                <WorkoutTodayCard
                  activeSession={store.activeWorkout}
                  completedCount={dailyTotals.completedWorkoutsCount}
                  isRestDay={effectiveIsRestDay}
                  todayRoutineName={todayRoutineName}
                  onToggleRestDay={isScheduleRestDay ? undefined : () => store.toggleRestDay(currentDate)}
                  onStartWorkout={() => handleStartWorkout()}
                  onResumeWorkout={() => handleTabChange("workouts")}
                  onDiscardWorkout={store.discardWorkout}
                />

                {/* Hydration Card */}
                <HydrationCard
                  waterConsumed={dailyTotals.waterConsumed}
                  waterTarget={dailyTotals.goal.water_ml}
                  onQuickAdd={(ml) => store.addWater(currentDate, ml)}
                  onOpenWaterModal={() => setIsAddWaterOpen(true)}
                />

                {/* Meals Logged Today */}
                <MealsCard
                  foodLogs={dayFoodLogs}
                  onAddFood={handleOpenAddFood}
                  onDeleteFood={store.deleteFoodLog}
                  onOpenCopyModal={() => setIsCopyMealsOpen(true)}
                />
              </div>

              {/* TABLET & DESKTOP LAYOUT (>= md): BALANCED MULTI-COLUMN GRID */}
              <div className="hidden md:block pb-10 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 lg:gap-6 items-start">
                  {/* Left Column (Tablet: 1 col [50%], Desktop: 7 cols [~58%]) */}
                  <div className="space-y-5 lg:col-span-7">
                    {/* Calorie & Macronutrient Summary */}
                    <EnergyCard
                      calorieTarget={dailyTotals.goal.calorie_target}
                      caloriesConsumed={dailyTotals.caloriesConsumed}
                      proteinTarget={dailyTotals.goal.protein_grams}
                      proteinConsumed={dailyTotals.proteinConsumed}
                      carbsTarget={dailyTotals.goal.carbs_grams}
                      carbsConsumed={dailyTotals.carbsConsumed}
                      fatTarget={dailyTotals.goal.fat_grams}
                      fatConsumed={dailyTotals.fatConsumed}
                    />

                    {/* Meals Logged Today */}
                    <MealsCard
                      foodLogs={dayFoodLogs}
                      onAddFood={handleOpenAddFood}
                      onDeleteFood={store.deleteFoodLog}
                      onOpenCopyModal={() => setIsCopyMealsOpen(true)}
                    />
                  </div>

                  {/* Right Column (Tablet: 1 col [50%], Desktop: 5 cols [~42%]) */}
                  <div className="space-y-5 lg:col-span-5">
                    {/* Quick Actions */}
                    <QuickActions
                      onAddFood={() => handleOpenAddFood("lunch")}
                      onAddWater={() => store.addWater(currentDate, 250)}
                      onStartWorkout={() => handleStartWorkout()}
                      onLogWeight={() => setIsRecordWeightOpen(true)}
                    />

                    {/* Workout Card */}
                    <WorkoutTodayCard
                      activeSession={store.activeWorkout}
                      completedCount={dailyTotals.completedWorkoutsCount}
                      isRestDay={effectiveIsRestDay}
                      todayRoutineName={todayRoutineName}
                      onToggleRestDay={isScheduleRestDay ? undefined : () => store.toggleRestDay(currentDate)}
                      onStartWorkout={() => handleStartWorkout()}
                      onResumeWorkout={() => handleTabChange("workouts")}
                      onDiscardWorkout={store.discardWorkout}
                    />

                    {/* Hydration Card */}
                    <HydrationCard
                      waterConsumed={dailyTotals.waterConsumed}
                      waterTarget={dailyTotals.goal.water_ml}
                      onQuickAdd={(ml) => store.addWater(currentDate, ml)}
                      onOpenWaterModal={() => setIsAddWaterOpen(true)}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Tab 2: Workouts */}
        {currentTab === "workouts" && (
          <div className="animate-fade-in">
            {store.activeWorkout ? (
              <ActiveWorkoutView
                session={store.activeWorkout}
                exercises={store.state.exercises}
                onUpdateSet={store.updateWorkoutSet}
                onAddSet={store.addSetToSession}
                onDeleteSet={store.deleteSetFromSession}
                onAddExerciseToSession={store.addExerciseToSession}
                onFinishWorkout={(sessionId, notes) => {
                  store.finishWorkout(sessionId, notes);
                  handleTabChange("dashboard");
                }}
                onDiscardWorkout={(sessionId) => {
                  store.discardWorkout(sessionId);
                  handleTabChange("dashboard");
                }}
              />
            ) : (
              <WorkoutView
                routines={store.state.routines}
                exercises={store.state.exercises}
                recentSessions={store.state.sessions}
                weeklySchedule={store.state.weeklySchedule}
                onUpdateWeeklySchedule={store.updateWeeklySchedule}
                onStartRoutine={handleStartWorkout}
                onOpenCreateRoutine={() => setIsCreateRoutineOpen(true)}
                onDeleteRoutine={store.deleteRoutine}
              />
            )}
          </div>
        )}

        {/* Tab 3: Nutrition */}
        {currentTab === "nutrition" && (
          <div className="animate-fade-in">
            <NutritionView
              foods={store.state.foods}
              foodLogs={dayFoodLogs}
              goal={dailyTotals.goal}
              onOpenAddFoodModal={() => handleOpenAddFood("lunch", "library")}
              onOpenQuickAdd={() => handleOpenAddFood("lunch", "quickAdd")}
              onOpenBarcodeScan={() => handleOpenAddFood("lunch", "scan")}
            />
          </div>
        )}

        {/* Tab 4: Progress */}
        {currentTab === "progress" && (
          <div className="animate-fade-in">
            <ProgressView
              weightLogs={store.state.weightLogs}
              measurementLogs={store.state.measurementLogs}
              completedSessions={completedSessions}
              onOpenWeightModal={() => setIsRecordWeightOpen(true)}
              onAddMeasurement={store.addMeasurementLog}
              milestoneSummary={milestoneSummary}
            />
          </div>
        )}

        {/* Tab 5: Settings */}
        {currentTab === "settings" && (
          <div className="animate-fade-in">
            <SettingsView
              profile={store.state.profile}
              goal={dailyTotals.goal}
              onUpdateProfile={store.updateProfile}
              onUpdateGoal={store.updateGoal}
              onResetOnboarding={store.resetOnboarding}
              authUser={store.authUser}
              isSyncing={store.isSyncing}
              syncStatus={store.syncStatus}
              onOpenAuth={() => setIsAuthOpen(true)}
              onSignOut={store.signOut}
              onRefreshCloudSync={store.refreshCloudSync}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        foods={store.state.foods}
        initialCategory={foodModalCategory}
        initialMode={foodModalMode}
        onLogFood={(data) => {
          store.addFoodLog({
            entry_date: currentDate,
            meal_category: data.meal_category,
            food_id: data.food_id,
            food_name_snapshot: data.food_name_snapshot,
            quantity: data.quantity,
            unit: data.unit,
            calories: data.calories,
            protein: data.protein,
            carbohydrates: data.carbohydrates,
            fat: data.fat,
            notes: data.notes,
          });
        }}
        onCreateCustomFood={store.addCustomFood}
      />

      <AddWaterModal
        isOpen={isAddWaterOpen}
        onClose={() => setIsAddWaterOpen(false)}
        waterLogs={dayWaterLogs}
        onAddWater={(ml) => store.addWater(currentDate, ml)}
        onDeleteWater={store.deleteWaterLog}
      />

      <RecordWeightModal
        isOpen={isRecordWeightOpen}
        onClose={() => setIsRecordWeightOpen(false)}
        currentDate={currentDate}
        latestWeight={store.state.profile.latest_weight_kg}
        onSaveWeight={(date, weight, notes) => store.addWeightLog(date, weight, notes)}
      />

      <CopyMealsModal
        isOpen={isCopyMealsOpen}
        onClose={() => setIsCopyMealsOpen(false)}
        yesterdayLogs={yesterdayFoodLogs}
        yesterdayDate={yesterdayDate}
        onCopy={(categories) => {
          store.copyMealsFromDate(yesterdayDate, currentDate, categories);
        }}
      />

      <CreateRoutineModal
        isOpen={isCreateRoutineOpen}
        onClose={() => setIsCreateRoutineOpen(false)}
        exercises={store.state.exercises}
        onCreateRoutine={(routineData, autoStart) => {
          const created = store.addRoutine(routineData);
          if (autoStart && created) {
            store.startWorkout(created.id);
            handleTabChange("workouts");
          }
        }}
      />

      {/* 1-Tap Day Summary Story Card Modal */}
      <ShareDayModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        dateStr={currentDate}
        userName={store.state.profile.display_name}
        dailyTotals={dailyTotals}
        completedSessions={completedSessions.filter((s) => s.entry_date === currentDate)}
        streakDays={streakDays}
      />

      {/* Cloud Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={() => setIsAuthOpen(false)}
      />

      {/* In-App PWA Install Banner */}
      <PWAInstallPrompt />

      {/* Sticky Bottom Navigation Bar */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        hasActiveWorkout={Boolean(store.activeWorkout)}
      />
      </div>
    </div>
  );
}
