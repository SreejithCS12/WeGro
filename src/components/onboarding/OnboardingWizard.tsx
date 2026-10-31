"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, ArrowLeft, Check, Target, User, Zap, Droplets } from "lucide-react";
import { FitnessGoalType, Profile, FitnessGoal } from "@/types/database";
import { calculateMacroSuggestions } from "@/lib/utils/calculator";
import { COMMON_TIMEZONES } from "@/lib/data/timezones";
import { WeGroLogo } from "@/components/ui/WeGroLogo";

interface OnboardingWizardProps {
  onComplete: (data: {
    profile: Partial<Profile>;
    goal: Partial<FitnessGoal>;
    initialWeightKg: number;
  }) => void;
  initialProfile?: Profile;
  initialGoal?: FitnessGoal;
}

export function OnboardingWizard({
  onComplete,
  initialProfile,
  initialGoal,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Biometrics
  const [displayName, setDisplayName] = useState(initialProfile?.display_name || "Sreejith");
  const [sex, setSex] = useState<"male" | "female" | "other">(initialProfile?.sex || "male");
  const [heightCm, setHeightCm] = useState(initialProfile?.height_cm || 178);
  const [weightKg, setWeightKg] = useState(initialProfile?.latest_weight_kg || 78.5);
  const [timezone, setTimezone] = useState(
    initialProfile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Kolkata"
  );

  // Step 2: Goal & Activity
  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoalType>(
    initialProfile?.fitness_goal || "maintain_weight"
  );
  const [activityLevel, setActivityLevel] = useState<"sedentary" | "light" | "moderate" | "active">(
    "moderate"
  );
  const [workoutsPerWeek, setWorkoutsPerWeek] = useState(initialGoal?.workouts_per_week || 4);

  // Step 3: Targets
  const [calorieTarget, setCalorieTarget] = useState(initialGoal?.calorie_target || 2400);
  const [proteinGrams, setProteinGrams] = useState(initialGoal?.protein_grams || 160);
  const [carbsGrams, setCarbsGrams] = useState(initialGoal?.carbs_grams || 260);
  const [fatGrams, setFatGrams] = useState(initialGoal?.fat_grams || 70);
  const [waterMl, setWaterMl] = useState(initialGoal?.water_ml || 3000);
  const [wasCalculated, setWasCalculated] = useState(false);

  // Macro Energy parity calculation
  const calculatedMacroKcal = proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;
  const parityRatio = Math.round((calculatedMacroKcal / (calorieTarget || 1)) * 100);

  const handleApplySuggestions = () => {
    const suggestions = calculateMacroSuggestions({
      weightKg,
      heightCm,
      sex,
      goal: fitnessGoal,
      activityLevel,
    });

    setCalorieTarget(suggestions.calories);
    setProteinGrams(suggestions.protein);
    setCarbsGrams(suggestions.carbs);
    setFatGrams(suggestions.fat);
    setWaterMl(suggestions.waterMl);
    setWasCalculated(true);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();

    onComplete({
      profile: {
        display_name: displayName,
        sex,
        height_cm: Number(heightCm),
        fitness_goal: fitnessGoal,
        timezone,
        activity_level: activityLevel,
      },
      goal: {
        calorie_target: Number(calorieTarget),
        protein_grams: Number(proteinGrams),
        carbs_grams: Number(carbsGrams),
        fat_grams: Number(fatGrams),
        water_ml: Number(waterMl),
        workouts_per_week: Number(workoutsPerWeek),
      },
      initialWeightKg: Number(weightKg),
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] text-[#f4f4f5] overflow-y-auto flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#141417] border border-[#27272a] rounded-3xl p-6 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-16 -right-16 w-44 h-44 bg-violet-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Wizard Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WeGroLogo size="sm" />
              <h2 className="text-base font-extrabold text-white">WeGro Setup</h2>
            </div>
            <span className="text-xs font-mono font-semibold text-violet-400">
              Step {step} of 3
            </span>
          </div>

          {/* Step Progress Dots */}
          <div className="flex items-center gap-1.5 pt-1">
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= 1 ? "bg-violet-500 shadow-sm shadow-violet-500/50" : "bg-zinc-800"
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= 2 ? "bg-violet-500 shadow-sm shadow-violet-500/50" : "bg-zinc-800"
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-all ${
                step >= 3 ? "bg-violet-500 shadow-sm shadow-violet-500/50" : "bg-zinc-800"
              }`}
            />
          </div>
        </div>

        {/* STEP 1: Personal Biometrics */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Personal Information</h3>
              <p className="text-xs text-zinc-400">Used to baseline energy and tracking boundaries.</p>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
                What should we call you?
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1.5 block">Sex</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "male", label: "Male" },
                  { id: "female", label: "Female" },
                  { id: "other", label: "Other" },
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSex(s.id as any)}
                    className={`py-2 rounded-xl text-xs font-semibold border transition-all ${
                      sex === s.id
                        ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30"
                        : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="100"
                  max="250"
                  value={heightCm}
                  onChange={(e) => setHeightCm(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
                  Starting Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="30"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white outline-none"
              >
                {COMMON_TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value} className="bg-[#18181b] text-white">
                    {tz.label} ({tz.offset})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-zinc-500 mt-1 block">
                Daily calorie and water logs reset at midnight in this timezone.
              </span>
            </div>

            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <span>Continue to Objective</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Objective & Activity */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Primary Fitness Focus</h3>
              <p className="text-xs text-zinc-400">Choose your current physical training phase.</p>
            </div>

            <div className="space-y-2">
              {[
                {
                  id: "lose_weight",
                  title: "📉 Cut / Lose Body Fat",
                  desc: "Energy deficit to burn fat while preserving muscle.",
                },
                {
                  id: "maintain_weight",
                  title: "⚖️ Maintain & Recompose",
                  desc: "Sustain body weight, improve tone and lift numbers.",
                },
                {
                  id: "gain_weight",
                  title: "📈 Bulk / Build Muscle",
                  desc: "Controlled surplus to fuel strength and muscle growth.",
                },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFitnessGoal(opt.id as any)}
                  className={`w-full p-3 rounded-2xl border text-left transition-all ${
                    fitnessGoal === opt.id
                      ? "bg-violet-950/40 border-violet-500 text-white shadow-md shadow-violet-600/20"
                      : "bg-[#18181b] border-[#27272a] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="text-xs font-bold text-white mb-0.5">{opt.title}</div>
                  <div className="text-[11px] text-zinc-400">{opt.desc}</div>
                </button>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
                Gym Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white outline-none"
              >
                <option value="sedentary">Sedentary (Desk work, 0-1 days)</option>
                <option value="light">Light (1-2 workouts / week)</option>
                <option value="moderate">Moderate (3-5 workouts / week)</option>
                <option value="active">Active (6-7 intense gym sessions / week)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">
                Target Workouts per Week
              </label>
              <input
                type="number"
                min="1"
                max="7"
                value={workoutsPerWeek}
                onChange={(e) => setWorkoutsPerWeek(Number(e.target.value))}
                className="w-32 px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Continue to Targets</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Daily Nutritional Targets */}
        {step === 3 && (
          <form onSubmit={handleFinish} className="space-y-4 animate-fade-in">
            <div>
              <h3 className="text-sm font-bold text-white mb-0.5">Daily Targets</h3>
              <p className="text-xs text-zinc-400">
                Enter your targets or auto-calculate based on your biometrics.
              </p>
            </div>

            {/* Smart Suggestion Button */}
            <button
              type="button"
              onClick={handleApplySuggestions}
              className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>Suggest Recommended Targets for Me</span>
            </button>

            {wasCalculated && (
              <p className="text-[11px] text-violet-300 text-center font-medium">
                ✓ Targets calculated for {weightKg}kg bodyweight & {fitnessGoal.replace("_", " ")}
              </p>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-zinc-300 mb-1 block">
                  Calories (kcal)
                </label>
                <input
                  type="number"
                  required
                  value={calorieTarget}
                  onChange={(e) => setCalorieTarget(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-violet-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-sky-400 mb-1 block">
                  Water (ml)
                </label>
                <input
                  type="number"
                  required
                  value={waterMl}
                  onChange={(e) => setWaterMl(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] focus:border-sky-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
                />
              </div>
            </div>

            {/* Macronutrients */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-rose-400 mb-1 block">
                  Protein (g)
                </label>
                <input
                  type="number"
                  required
                  value={proteinGrams}
                  onChange={(e) => setProteinGrams(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-rose-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
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
                  className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-amber-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
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
                  className="w-full px-2.5 py-1.5 bg-[#18181b] border border-[#27272a] focus:border-emerald-500 rounded-xl text-xs text-white font-mono font-bold outline-none"
                />
              </div>
            </div>

            {/* Parity check pill */}
            <div className="p-2 rounded-xl bg-[#18181b] border border-[#27272a] text-[10px] text-zinc-400 flex items-center justify-between font-mono">
              <span>
                Macros: ({proteinGrams}×4) + ({carbsGrams}×4) + ({fatGrams}×9) = {calculatedMacroKcal} kcal
              </span>
              <span
                className={`font-bold ${
                  Math.abs(parityRatio - 100) <= 5 ? "text-emerald-400" : "text-amber-400"
                }`}
              >
                {parityRatio}% match
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-3 px-4 rounded-xl bg-zinc-800 text-zinc-300 font-semibold text-xs flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-violet-600/40 flex items-center justify-center gap-2 active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Complete Setup</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
