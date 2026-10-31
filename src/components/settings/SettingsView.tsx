"use client";

import { useState } from "react";
import {
  Settings,
  Target,
  User,
  Database,
  Check,
  Sparkles,
  RotateCcw,
  Palette,
  Cloud,
  RefreshCw,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { Profile, FitnessGoal } from "@/types/database";
import { calculateMacroSuggestions } from "@/lib/utils/calculator";
import { COMMON_TIMEZONES } from "@/lib/data/timezones";
import { AppThemeColor, THEME_OPTIONS, applyTheme, getStoredTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface SettingsViewProps {
  profile: Profile;
  goal: FitnessGoal;
  onUpdateProfile: (updates: Partial<Profile>) => void;
  onUpdateGoal: (updates: Partial<FitnessGoal>) => void;
  onResetOnboarding?: () => void;
  authUser?: any | null;
  isSyncing?: boolean;
  syncStatus?: "idle" | "syncing" | "synced" | "offline";
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  onRefreshCloudSync?: () => void;
}

export function SettingsView({
  profile,
  goal,
  onUpdateProfile,
  onUpdateGoal,
  onResetOnboarding,
  authUser,
  isSyncing = false,
  syncStatus = "idle",
  onOpenAuth,
  onSignOut,
  onRefreshCloudSync,
}: SettingsViewProps) {
  // Goal states
  const [calorieTarget, setCalorieTarget] = useState(goal.calorie_target);
  const [proteinGrams, setProteinGrams] = useState(goal.protein_grams);
  const [carbsGrams, setCarbsGrams] = useState(goal.carbs_grams);
  const [fatGrams, setFatGrams] = useState(goal.fat_grams);
  const [waterMl, setWaterMl] = useState(goal.water_ml);
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(goal.workouts_per_week || 4);

  // Profile states
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [sex, setSex] = useState<"male" | "female" | "other">(profile.sex || "male");
  const [heightCm, setHeightCm] = useState(profile.height_cm || 178);
  const [fitnessGoal, setFitnessGoal] = useState(profile.fitness_goal || "maintain_weight");
  const [timezone, setTimezone] = useState(profile.timezone || "Asia/Kolkata");
  const [themeColor, setThemeColor] = useState<AppThemeColor>(
    profile.theme_color || getStoredTheme()
  );

  const [savedMessage, setSavedMessage] = useState(false);
  const [calcNotice, setCalcNotice] = useState(false);

  // Parity check
  const calculatedMacroKcal = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;
  const parityRatio = Math.round((calculatedMacroKcal / (calorieTarget || 1)) * 100);

  const handleSuggest = () => {
    const weight = profile.latest_weight_kg || 78.5;
    const suggestions = calculateMacroSuggestions({
      weightKg: weight,
      heightCm: Number(heightCm) || 178,
      sex,
      goal: fitnessGoal as any,
      activityLevel: "moderate",
    });

    setCalorieTarget(suggestions.calories);
    setProteinGrams(suggestions.protein);
    setCarbsGrams(suggestions.carbs);
    setFatGrams(suggestions.fat);
    setWaterMl(suggestions.waterMl);
    setCalcNotice(true);
    setTimeout(() => setCalcNotice(false), 3000);
  };

  const handleSelectTheme = (newTheme: AppThemeColor) => {
    setThemeColor(newTheme);
    applyTheme(newTheme);
    onUpdateProfile({ theme_color: newTheme });
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    onUpdateGoal({
      calorie_target: Number(calorieTarget),
      protein_grams: Number(proteinGrams),
      carbs_grams: Number(carbsGrams),
      fat_grams: Number(fatGrams),
      water_ml: Number(waterMl),
      workouts_per_week: Number(workoutsPerWeek),
    });

    onUpdateProfile({
      display_name: displayName,
      sex,
      height_cm: Number(heightCm),
      fitness_goal: fitnessGoal as any,
      timezone: timezone,
      theme_color: themeColor,
    });

    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 2500);
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Account & Cloud Sync Section */}
      <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-violet-500/15 text-violet-400 shrink-0">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-100">
                  Cloud Sync & Backup
                </h3>
                <span
                  className={cn(
                    "text-[10px] font-semibold px-2 py-0.5 rounded-full border inline-flex items-center gap-1.5",
                    authUser
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/25"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      authUser ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                    )}
                  />
                  <span>{authUser ? "Cloud Synced" : "Guest Mode (Local)"}</span>
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Keep your fitness records backed up and synced across all your devices
              </p>
            </div>
          </div>
        </div>

        {authUser ? (
          <div className="space-y-3 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">
                  Account Email
                </span>
                <span className="text-xs font-semibold text-white break-all">{authUser.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider block mb-0.5">
                  Backup Status
                </span>
                <span className="text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active & Synced
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              {onRefreshCloudSync && (
                <button
                  type="button"
                  onClick={onRefreshCloudSync}
                  disabled={isSyncing}
                  className="py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", isSyncing && "animate-spin text-violet-400")} />
                  <span>{isSyncing ? "Syncing..." : "Sync Now"}</span>
                </button>
              )}

              {onSignOut && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="py-2 px-3 rounded-xl bg-red-950/30 hover:bg-red-900/40 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ml-auto"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-zinc-300 leading-relaxed">
              Your workouts, nutrition, and hydration are currently stored only on this browser. Sign in or create an account to back up everything securely to the cloud and sync across all your phones, tablets, and computers.
            </p>

            {onOpenAuth && (
              <button
                type="button"
                onClick={onOpenAuth}
                className="py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-violet-600/30 cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-4 h-4" />
                <span>Sign In / Connect Cloud</span>
              </button>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-5">
        {/* App Theme & White-Labeling */}
        <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-3.5 sm:p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400 shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                  App Color Theme
                </h3>
                <p className="text-[11px] text-zinc-400 hidden sm:block">
                  Personalize the interface accent color across buttons, nav, and badges
                </p>
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 shrink-0">
              {THEME_OPTIONS.find((t) => t.id === themeColor)?.name || "Purple"}
            </span>
          </div>

          {/* Compact 5-Color Swatch Row */}
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {THEME_OPTIONS.map((t) => {
              const isSelected = themeColor === t.id;
              const shortLabel = t.id.charAt(0).toUpperCase() + t.id.slice(1);

              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectTheme(t.id)}
                  className={cn(
                    "flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all cursor-pointer group active:scale-95 border",
                    isSelected
                      ? "bg-zinc-800/80 border-white/40 shadow-sm"
                      : "bg-[#18181b]/70 border-transparent hover:bg-zinc-800/40 hover:border-zinc-700/50"
                  )}
                >
                  {/* Swatch circle */}
                  <div
                    className={cn(
                      "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all relative shrink-0",
                      isSelected && "ring-2 ring-white ring-offset-2 ring-offset-[#141417] scale-105"
                    )}
                    style={{
                      backgroundColor: t.previewHex,
                      boxShadow: isSelected ? `0 0 10px ${t.glowColor}` : undefined,
                    }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                  </div>

                  <span
                    className={cn(
                      "text-[10px] sm:text-xs font-semibold mt-1.5 truncate max-w-full",
                      isSelected ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  >
                    {shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Daily Fitness Goals */}
          <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                  Daily Nutritional Targets
                </h3>
                <p className="text-[11px] text-zinc-400">Benchmarked against your daily logs</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSuggest}
              className="py-1 px-2.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Suggest</span>
            </button>
          </div>

          {calcNotice && (
            <p className="text-[11px] text-violet-300 text-center font-medium bg-violet-950/30 py-1 rounded-lg border border-violet-500/20">
              ✓ Targets re-calculated from your current biometrics & goal.
            </p>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
                Daily Calorie Target (kcal)
              </label>
              <input
                type="number"
                required
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-sky-400 mb-1 block">
                Daily Water Target (ml)
              </label>
              <input
                type="number"
                required
                value={waterMl}
                onChange={(e) => setWaterMl(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-sky-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#27272a]">
            <div>
              <label className="text-[10px] font-semibold text-rose-400 mb-1 block">
                Protein (g)
              </label>
              <input
                type="number"
                required
                value={proteinGrams}
                onChange={(e) => setProteinGrams(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-rose-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-amber-400 mb-1 block">
                Carbs (g)
              </label>
              <input
                type="number"
                required
                value={carbsGrams}
                onChange={(e) => setCarbsGrams(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-amber-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="text-[10px] font-semibold text-emerald-400 mb-1 block">
                Fat (g)
              </label>
              <input
                type="number"
                required
                value={fatGrams}
                onChange={(e) => setFatGrams(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-emerald-500 font-mono font-bold"
              />
            </div>
          </div>

          {/* Macro check */}
          <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-[10px] text-zinc-400 flex items-center justify-between font-mono">
            <span>
              Macro Energy: ({proteinGrams}×4) + ({carbsGrams}×4) + ({fatGrams}×9) = {calculatedMacroKcal} kcal
            </span>
            <span
              className={`font-bold ${
                Math.abs(parityRatio - 100) <= 5 ? "text-emerald-400" : "text-amber-400"
              }`}
            >
              {parityRatio}% parity
            </span>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
              Workouts per Week Goal
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={workoutsPerWeek}
              onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
              className="w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500 font-mono font-bold"
            />
          </div>
        </div>

        {/* Profile Settings */}
        <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Personal Profile
              </h3>
              <p className="text-[11px] text-zinc-400">Biometric and account preferences</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500 font-mono font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Primary Goal</label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500"
              >
                <option value="lose_weight">Lose Weight / Cut</option>
                <option value="maintain_weight">Maintain Weight</option>
                <option value="gain_weight">Build Muscle / Bulk</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400 mb-1 block">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value} className="bg-[#18181b] text-white">
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        </div>

        {/* Re-run Onboarding Section */}
        {onResetOnboarding && (
          <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-white">Setup Wizard</h4>
              <p className="text-[10px] text-zinc-400">Re-run the initial 3-step setup onboarding</p>
            </div>
            <button
              type="button"
              onClick={onResetOnboarding}
              className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-colors border border-[#27272a]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-violet-400" />
              <span>Restart Wizard</span>
            </button>
          </div>
        )}

        {/* Save CTA */}
        <div className="sticky bottom-16 z-20">
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-violet-600/40 flex items-center justify-center gap-2 active:scale-95"
          >
            {savedMessage ? <Check className="w-4 h-4" /> : null}
            <span>{savedMessage ? "Preferences Saved!" : "Save Preferences"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
