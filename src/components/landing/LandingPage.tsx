"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  Check,
  Flame,
  Dumbbell,
  Barcode,
  Smartphone,
  Zap,
  ShieldCheck,
  Trophy,
  Clock,
  Droplets,
  ChevronDown,
  QrCode,
  Share2,
  Copy,
  Target,
  TrendingUp,
  Activity,
  CheckCircle2,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { WeGroLogo } from "@/components/ui/WeGroLogo";

interface LandingPageProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

type PreviewTab = "dashboard" | "barcode" | "hypertrophy" | "milestones";
type CalcGoal = "cut" | "maintain" | "bulk";
type CalcActivity = "light" | "moderate" | "heavy";

export function LandingPage({ onGetStarted, onSignIn }: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<PreviewTab>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [appUrl, setAppUrl] = useState("https://wegro.app");
  const [copiedLink, setCopiedLink] = useState(false);

  // Quick Macro Calculator interactive state
  const [calcGoal, setCalcGoal] = useState<CalcGoal>("cut");
  const [calcWeight, setCalcWeight] = useState<number>(75);
  const [calcUnit, setCalcUnit] = useState<"kg" | "lbs">("kg");
  const [calcActivity, setCalcActivity] = useState<CalcActivity>("moderate");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAppUrl(window.location.origin);
    }
  }, []);

  const handleCopyLink = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(appUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Interactive Calculator output
  const weightInKg = calcUnit === "lbs" ? calcWeight * 0.453592 : calcWeight;
  const baseCalFactor = calcActivity === "light" ? 30 : calcActivity === "heavy" ? 36 : 33;
  const maintenanceCal = Math.round(weightInKg * baseCalFactor);
  const targetCalories =
    calcGoal === "cut"
      ? Math.max(1200, maintenanceCal - 450)
      : calcGoal === "bulk"
      ? maintenanceCal + 350
      : maintenanceCal;
  const proteinMultiplier = calcGoal === "cut" ? 2.2 : 2.0;
  const targetProtein = Math.round(weightInKg * proteinMultiplier);
  const targetFat = Math.round((targetCalories * 0.25) / 9);
  const targetCarbs = Math.max(30, Math.round((targetCalories - targetProtein * 4 - targetFat * 9) / 4));

  const faqItems = [
    {
      q: "Is WeGro completely free to use?",
      a: "Yes! 100% free with no credit card required. Unlike traditional apps that lock barcode scanning or macro charts behind a $19.99/month paywall, WeGro gives you full access to barcode scanning, hypertrophy logging, and cloud sync for free.",
    },
    {
      q: "Do I have to download it from the App Store or Google Play?",
      a: "No downloads required! WeGro is built as a progressive web app (PWA). You can use it directly in any browser on iPhone, Android, Mac, or PC, or tap 'Add to Home Screen' to install it with native app speed, zero storage bloat, and an instant icon.",
    },
    {
      q: "Does it work without an internet connection in the gym?",
      a: "Yes. WeGro features an offline-first architecture. You can log sets, check routines, and record food in a basement gym with zero cell signal. Everything is queued locally and syncs to the cloud automatically the moment you reconnect.",
    },
    {
      q: "How does the barcode scanner work in the browser?",
      a: "WeGro uses modern web camera APIs and connects directly to the OpenFoodFacts global database of millions of products. Just point your phone or laptop camera at any food barcode to pull exact calories, protein, carbs, and fats instantly.",
    },
    {
      q: "Can I log my workouts and nutrition in the same place?",
      a: "Yes, that is the main superpower of WeGro! Instead of juggling one app for food tracking (like MyFitnessPal) and another for lifting (like Hevy or Strong), WeGro unifies your daily energy balance, hypertrophy sets, rest timers, hydration, and bodyweight in one clean dashboard.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] selection:bg-violet-600 selection:text-white relative overflow-x-hidden">
      {/* Background ambient cosmic glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-violet-600/15 via-purple-600/5 to-transparent blur-[140px]" />
        <div className="absolute top-[1200px] left-[-200px] w-[600px] h-[600px] bg-violet-800/10 rounded-full blur-[160px]" />
        <div className="absolute top-[2400px] right-[-200px] w-[600px] h-[600px] bg-fuchsia-800/10 rounded-full blur-[160px]" />
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* 1. Header / Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09090b]/80 border-b border-zinc-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="relative group cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl blur-md opacity-50 group-hover:opacity-80 transition duration-300" />
              <WeGroLogo size="sm" />
            </div>
            <div className="flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-lg sm:text-xl font-black tracking-tight text-white">WeGro</span>
              <span className="hidden sm:inline-flex text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-950/80 border border-violet-700/50 text-violet-300">
                PRO FREE
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              App Preview
            </a>
            <a href="#calculator" className="hover:text-white transition-colors">
              Macro Calculator
            </a>
            <a href="#comparison" className="hover:text-white transition-colors">
              Why WeGro
            </a>
            <a href="#pwa" className="hover:text-white transition-colors">
              Install (PWA)
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onSignIn}
              className="hidden sm:inline-flex text-xs font-semibold text-zinc-300 hover:text-white px-3 sm:px-4 py-2 rounded-xl hover:bg-zinc-800/70 transition-all cursor-pointer whitespace-nowrap"
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={onGetStarted}
              className="relative group text-xs font-bold text-white px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 shadow-lg shadow-violet-600/30 hover:shadow-violet-600/50 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 whitespace-nowrap"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Mobile menu button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-zinc-800 bg-[#0c0c0e]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-fade-in">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Features
            </a>
            <a
              href="#preview"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Interactive Preview
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Macro Calculator
            </a>
            <a
              href="#comparison"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Comparison
            </a>
            <a
              href="#pwa"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              Install on Mobile
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-medium text-zinc-300 hover:text-white py-1.5"
            >
              FAQ
            </a>
            <div className="pt-2 border-t border-zinc-800 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSignIn();
                }}
                className="flex-1 py-2.5 text-center text-xs font-semibold rounded-xl bg-zinc-800 text-white hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onGetStarted();
                }}
                className="flex-1 py-2.5 text-center text-xs font-bold rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-colors cursor-pointer"
              >
                Get Started Free
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 2. Hero Section */}
      <section className="relative z-10 pt-12 sm:pt-24 pb-14 sm:pb-20 px-3.5 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        {/* Announcement Badge */}
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-violet-950/50 border border-violet-700/40 text-violet-300 text-[11px] sm:text-xs font-medium mb-5 sm:mb-6 backdrop-blur-md shadow-inner shadow-violet-500/10 animate-fade-in max-w-full">
          <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
          <span className="truncate sm:whitespace-normal">Zero Subscriptions. Zero Ads. 100% Free Forever.</span>
        </div>

        {/* Main Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.12]">
          Track Today.{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-300 to-fuchsia-400 bg-clip-text text-transparent">
            Grow Tomorrow.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-4 sm:mt-6 text-sm sm:text-lg lg:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
          The all-in-one tracker designed for lifters and health enthusiasts. Precision macros, instant barcode scanning,
          hypertrophy workout logs, rest timers, and offline cloud sync — without the bloatware.
        </p>

        {/* Hero CTAs */}
        <div className="mt-7 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-md mx-auto">
          <button
            type="button"
            onClick={onGetStarted}
            className="w-full sm:w-auto px-6 sm:px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm shadow-xl shadow-violet-600/30 hover:shadow-violet-600/50 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 group"
          >
            <span>Start Tracking Free</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <a
            href="#preview"
            className="w-full sm:w-auto px-5 sm:px-6 py-3.5 rounded-2xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
          >
            <span>Explore Live Demo</span>
            <ChevronDown className="w-4 h-4 text-zinc-400" />
          </a>
        </div>

        {/* Micro Value Highlights */}
        <div className="mt-10 sm:mt-14 pt-7 sm:pt-8 border-t border-zinc-800/80 max-w-3xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 text-center">
          <div className="flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
            <Barcode className="w-4 sm:w-5 h-4 sm:h-5 text-violet-400" />
            <span className="text-[11px] sm:text-xs font-bold text-white">Free Barcode Scan</span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400">OpenFoodFacts DB</span>
          </div>

          <div className="flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
            <Dumbbell className="w-4 sm:w-5 h-4 sm:h-5 text-purple-400" />
            <span className="text-[11px] sm:text-xs font-bold text-white">Hypertrophy Logs</span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400">RPE, 1RM & Timer</span>
          </div>

          <div className="flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
            <Zap className="w-4 sm:w-5 h-4 sm:h-5 text-emerald-400" />
            <span className="text-[11px] sm:text-xs font-bold text-white">Offline-First PWA</span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400">Works without signal</span>
          </div>

          <div className="flex flex-col items-center gap-1 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-zinc-900/40 border border-zinc-800/60">
            <ShieldCheck className="w-4 sm:w-5 h-4 sm:h-5 text-blue-400" />
            <span className="text-[11px] sm:text-xs font-bold text-white">100% Ad-Free</span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400">Privacy respected</span>
          </div>
        </div>
      </section>

      {/* 3. Interactive App Showcase (Mock Phone / Live View) */}
      <section id="preview" className="relative z-10 py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Experience</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Designed for Speed, Focus & Aesthetic Pleasure
          </h2>
          <p className="text-sm text-zinc-400 max-w-xl mx-auto mt-2">
            Switch between modules below to see how WeGro handles daily nutrition, camera scanning, hypertrophy logging, and milestone achievements.
          </p>

          {/* Tab Switcher */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-center gap-1.5 sm:gap-2 mt-7 sm:mt-8 p-1.5 bg-zinc-900/80 border border-zinc-800 rounded-2xl max-w-xl mx-auto">
            <button
              type="button"
              onClick={() => setActivePreviewTab("dashboard")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activePreviewTab === "dashboard"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Target className="w-3.5 h-3.5" />
              <span>Energy & Macros</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("barcode")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activePreviewTab === "barcode"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Barcode className="w-3.5 h-3.5" />
              <span>Barcode Scanner</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("hypertrophy")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activePreviewTab === "hypertrophy"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Dumbbell className="w-3.5 h-3.5" />
              <span>Hypertrophy Logger</span>
            </button>
            <button
              type="button"
              onClick={() => setActivePreviewTab("milestones")}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activePreviewTab === "milestones"
                  ? "bg-violet-600 text-white shadow-lg shadow-violet-600/40"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              <span>Milestones</span>
            </button>
          </div>
        </div>

        {/* Mock Phone Frame & Screen */}
        <div className="relative mx-auto max-w-sm sm:max-w-md">
          {/* Subtle phone halo glow */}
          <div className="absolute -inset-3 sm:-inset-4 bg-gradient-to-tr from-violet-600/25 via-purple-600/10 to-fuchsia-600/20 rounded-[34px] sm:rounded-[44px] blur-2xl opacity-75" />

          {/* Phone body */}
          <div className="relative bg-[#101014] border-2 sm:border-4 border-zinc-800 rounded-[28px] sm:rounded-[38px] p-2 sm:p-3 shadow-2xl overflow-hidden">
            {/* Dynamic island notch */}
            <div className="absolute top-3 sm:top-4 left-1/2 -translate-x-1/2 w-24 sm:w-28 h-3.5 sm:h-4 bg-zinc-900 rounded-full z-20 flex items-center justify-end px-2.5 sm:px-3">
              <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-violet-500/80 animate-pulse" />
            </div>

            {/* Inner Phone Screen Content */}
            <div className="bg-[#0c0c0e] border border-zinc-800/80 rounded-[22px] sm:rounded-[30px] p-3 sm:p-4 pt-6 sm:pt-8 min-h-[490px] sm:min-h-[520px] flex flex-col justify-between text-left select-none relative overflow-hidden">
              {/* Tab 1: Dashboard View */}
              {activePreviewTab === "dashboard" && (
                <div className="space-y-3.5 sm:space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] sm:text-[10px] text-zinc-500 uppercase font-semibold">Today • Sun, Nov 1</span>
                      <h3 className="text-xs sm:text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Energy & Macros</span>
                        <span className="px-1.5 py-0.2 bg-emerald-500/10 text-emerald-400 text-[9px] sm:text-[10px] rounded-md font-semibold">
                          On Track
                        </span>
                      </h3>
                    </div>
                    <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 sm:py-1 rounded-full text-amber-400 text-[11px] sm:text-xs font-bold">
                      <Flame className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400" />
                      <span>14 Days</span>
                    </div>
                  </div>

                  {/* Energy Card Mockup */}
                  <div className="bg-[#141417] border border-zinc-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2.5 sm:mb-3">
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-white">2,180</div>
                        <div className="text-[10px] sm:text-[11px] text-zinc-400">of 2,550 kcal target</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold text-violet-400">370 kcal</div>
                        <div className="text-[9px] sm:text-[10px] text-zinc-500">remaining</div>
                      </div>
                    </div>

                    {/* Calorie Bar */}
                    <div className="w-full bg-zinc-800 h-2 sm:h-2.5 rounded-full overflow-hidden mb-3 sm:mb-4">
                      <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-full rounded-full w-[85%]" />
                    </div>

                    {/* Macro Split Pills */}
                    <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                      <div className="bg-zinc-900/80 p-1.5 sm:p-2 rounded-xl border border-zinc-800/60">
                        <div className="text-[9px] sm:text-[10px] text-rose-400 font-semibold">PROTEIN</div>
                        <div className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">165g / 180g</div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-1 sm:mt-1.5">
                          <div className="bg-rose-500 h-full rounded-full w-[91%]" />
                        </div>
                      </div>

                      <div className="bg-zinc-900/80 p-1.5 sm:p-2 rounded-xl border border-zinc-800/60">
                        <div className="text-[9px] sm:text-[10px] text-amber-400 font-semibold">CARBS</div>
                        <div className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">215g / 260g</div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-1 sm:mt-1.5">
                          <div className="bg-amber-500 h-full rounded-full w-[82%]" />
                        </div>
                      </div>

                      <div className="bg-zinc-900/80 p-1.5 sm:p-2 rounded-xl border border-zinc-800/60">
                        <div className="text-[9px] sm:text-[10px] text-emerald-400 font-semibold">FATS</div>
                        <div className="text-[11px] sm:text-xs font-bold text-white whitespace-nowrap">58g / 65g</div>
                        <div className="w-full bg-zinc-800 h-1 rounded-full mt-1 sm:mt-1.5">
                          <div className="bg-emerald-500 h-full rounded-full w-[89%]" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hydration & Quick Meal */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#141417] border border-zinc-800 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-sky-400 font-bold flex items-center gap-1">
                          <Droplets className="w-3 h-3" />
                          <span>HYDRATION</span>
                        </div>
                        <div className="text-sm font-black text-white mt-0.5">2,500 ml</div>
                        <div className="text-[10px] text-zinc-400">Goal: 3,000 ml</div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold text-xs">
                        +
                      </div>
                    </div>

                    <div className="bg-[#141417] border border-zinc-800 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-purple-400 font-bold flex items-center gap-1">
                          <Dumbbell className="w-3 h-3" />
                          <span>TODAY'S LIFT</span>
                        </div>
                        <div className="text-xs font-black text-white mt-0.5">Push Hypertrophy</div>
                        <div className="text-[10px] text-emerald-400">Completed 42m</div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>

                  {/* Logged Meal Preview */}
                  <div className="bg-[#141417] border border-zinc-800 p-3 rounded-2xl">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-bold text-white">Lunch • 780 kcal</span>
                      <span className="text-zinc-500 text-[10px]">3 foods logged</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-zinc-300">
                      <div className="flex justify-between">
                        <span>Grilled Chicken Breast (200g)</span>
                        <span className="font-mono text-zinc-400">330 kcal • 62g P</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Jasmine White Rice (180g)</span>
                        <span className="font-mono text-zinc-400">235 kcal • 53g C</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Barcode Scanner View */}
              {activePreviewTab === "barcode" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-violet-400 font-bold uppercase tracking-wider">
                        Camera Intelligence
                      </span>
                      <h3 className="text-sm font-bold text-white">Barcode Scanner</h3>
                    </div>
                    <span className="text-[10px] font-semibold bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full border border-violet-500/30">
                      Live Detector
                    </span>
                  </div>

                  {/* Simulated Viewfinder */}
                  <div className="relative h-44 rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col items-center justify-center">
                    {/* Viewfinder corners */}
                    <div className="absolute inset-5 border-2 border-dashed border-violet-500/50 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-pulse shadow-lg shadow-violet-500" />
                    </div>
                    <Barcode className="w-10 h-10 text-zinc-700 mb-2" />
                    <span className="text-[11px] text-zinc-400 font-medium">Align package barcode in box</span>
                  </div>

                  {/* Product Match Card */}
                  <div className="bg-[#141417] border border-violet-500/30 rounded-2xl p-3.5 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Matched via OpenFoodFacts</span>
                        </span>
                        <h4 className="text-xs font-bold text-white mt-0.5">Greek Skyr Yogurt (0% Fat)</h4>
                        <div className="text-[10px] text-zinc-400">Serving size: 170g container</div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-violet-300">110 kcal</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-1.5 pt-1 border-t border-zinc-800 text-center">
                      <div className="bg-zinc-900/90 py-1 rounded-lg">
                        <div className="text-[9px] text-rose-400 font-bold">19.0g</div>
                        <div className="text-[8px] text-zinc-500">PROTEIN</div>
                      </div>
                      <div className="bg-zinc-900/90 py-1 rounded-lg">
                        <div className="text-[9px] text-amber-400 font-bold">6.0g</div>
                        <div className="text-[8px] text-zinc-500">CARBS</div>
                      </div>
                      <div className="bg-zinc-900/90 py-1 rounded-lg">
                        <div className="text-[9px] text-emerald-400 font-bold">0.2g</div>
                        <div className="text-[8px] text-zinc-500">FAT</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onGetStarted}
                      className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-[11px] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1 mt-1"
                    >
                      <span>1-Tap Add to Lunch</span>
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {/* Tab 3: Hypertrophy Logger View */}
              {activePreviewTab === "hypertrophy" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider">
                        Active Workout
                      </span>
                      <h3 className="text-sm font-bold text-white">Incline Dumbbell Press</h3>
                    </div>
                    {/* Rest timer countdown */}
                    <div className="flex items-center gap-1 bg-zinc-900 border border-violet-500/40 px-2 py-1 rounded-xl text-violet-300 text-xs font-mono font-bold">
                      <Clock className="w-3 h-3 text-violet-400 animate-spin" />
                      <span>01:45</span>
                    </div>
                  </div>

                  {/* Exercise Set Table */}
                  <div className="bg-[#141417] border border-zinc-800 rounded-2xl p-3">
                    <div className="grid grid-cols-4 text-[10px] font-bold text-zinc-500 pb-2 border-b border-zinc-800 text-center">
                      <span>SET</span>
                      <span>KG</span>
                      <span>REPS</span>
                      <span>RPE</span>
                    </div>

                    <div className="space-y-1.5 pt-2 text-xs text-center font-mono">
                      <div className="grid grid-cols-4 items-center bg-zinc-900/80 py-1.5 rounded-lg border border-zinc-800/80 text-zinc-400">
                        <span className="font-sans font-bold text-zinc-500">1</span>
                        <span>30.0</span>
                        <span>12</span>
                        <span className="text-emerald-400 font-sans text-[11px]">8.0</span>
                      </div>
                      <div className="grid grid-cols-4 items-center bg-zinc-900/80 py-1.5 rounded-lg border border-zinc-800/80 text-zinc-400">
                        <span className="font-sans font-bold text-zinc-500">2</span>
                        <span>34.0</span>
                        <span>10</span>
                        <span className="text-amber-400 font-sans text-[11px]">8.5</span>
                      </div>
                      <div className="grid grid-cols-4 items-center bg-violet-950/40 py-1.5 rounded-lg border border-violet-600/40 text-white font-bold shadow-inner">
                        <span className="font-sans font-bold text-violet-400">3 (PR)</span>
                        <span>36.0</span>
                        <span>8</span>
                        <span className="text-rose-400 font-sans text-[11px]">9.5</span>
                      </div>
                    </div>
                  </div>

                  {/* Volume stats */}
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="bg-[#141417] border border-zinc-800 p-2 rounded-xl">
                      <div className="text-[9px] text-zinc-500">TOTAL VOLUME</div>
                      <div className="text-xs font-bold text-white font-mono">1,128 kg</div>
                    </div>
                    <div className="bg-[#141417] border border-zinc-800 p-2 rounded-xl">
                      <div className="text-[9px] text-zinc-500">CALCULATED 1RM</div>
                      <div className="text-xs font-bold text-violet-400 font-mono">44.6 kg</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 4: Milestone Badges */}
              {activePreviewTab === "milestones" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                        Gamification & Proof
                      </span>
                      <h3 className="text-sm font-bold text-white">Tiered Milestones</h3>
                    </div>
                    <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
                      Level 5 Lifter
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="bg-[#141417] border border-amber-500/30 p-3 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-1.5 shadow-lg shadow-amber-500/10">
                        <Flame className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div className="text-xs font-bold text-white">Streak Master</div>
                      <div className="text-[9px] text-zinc-400">14 Days Active</div>
                      <div className="text-[9px] text-amber-400 font-semibold mt-1">GOLD TIER</div>
                    </div>

                    <div className="bg-[#141417] border border-violet-500/30 p-3 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/40 flex items-center justify-center text-violet-400 mb-1.5 shadow-lg shadow-violet-500/10">
                        <Dumbbell className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-white">Iron Titan</div>
                      <div className="text-[9px] text-zinc-400">10,000+ kg Lifted</div>
                      <div className="text-[9px] text-violet-400 font-semibold mt-1">DIAMOND TIER</div>
                    </div>

                    <div className="bg-[#141417] border border-rose-500/30 p-3 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-1.5">
                        <Target className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-white">Macro Precision</div>
                      <div className="text-[9px] text-zinc-400">Protein Target Hit</div>
                      <div className="text-[9px] text-rose-400 font-semibold mt-1">PLATINUM</div>
                    </div>

                    <div className="bg-[#141417] border border-sky-500/30 p-3 rounded-2xl flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/40 flex items-center justify-center text-sky-400 mb-1.5">
                        <Droplets className="w-5 h-5" />
                      </div>
                      <div className="text-xs font-bold text-white">Hydration Elite</div>
                      <div className="text-[9px] text-zinc-400">3L Target Reached</div>
                      <div className="text-[9px] text-sky-400 font-semibold mt-1">SILVER TIER</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Nav Simulation */}
              <div className="pt-3 border-t border-zinc-800 flex justify-around text-zinc-500 text-[10px]">
                <div className="flex flex-col items-center text-violet-400 font-bold">
                  <Target className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Today</span>
                </div>
                <div className="flex flex-col items-center">
                  <Activity className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Nutrition</span>
                </div>
                <div className="flex flex-col items-center">
                  <Dumbbell className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Workouts</span>
                </div>
                <div className="flex flex-col items-center">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-[9px] mt-0.5">Progress</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Bento Grid */}
      <section id="features" className="relative z-10 py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Built Without Compromise</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Everything You Need to Build Muscle & Cut Fat
          </h2>
          <p className="mt-3 text-zinc-400 text-sm sm:text-base">
            No fragmented tools. WeGro unites complete nutrition intelligence with rigorous strength tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Bento Card 1: Nutrition & Barcode */}
          <div className="md:col-span-2 bg-[#121215] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-violet-600/40 transition-all duration-300">
            <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none group-hover:bg-violet-600/20 transition-all" />
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-5">
              <Barcode className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Instant Barcode Scanning & OpenFoodFacts</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mb-6">
              Never pay $20 a month just to scan food. Scan any packaged food barcode with your device camera to extract verified calories, macros, and micro-nutrients in milliseconds.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-zinc-300">
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">📷 Real-time Camera Viewfinder</span>
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">⚡ 1-Tap Copy Yesterday's Meals</span>
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">🥗 Custom Quick Add</span>
            </div>
          </div>

          {/* Bento Card 2: Offline-First PWA */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-violet-600/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Offline-First PWA Sync</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Stuck in an underground gym with zero reception? WeGro stores your workout sets and nutrition locally, then silently syncs when you're back online.
            </p>
            <div className="flex flex-col gap-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero loading delays</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero app store bloatware</span>
              </div>
            </div>
          </div>

          {/* Bento Card 3: Hypertrophy & Workouts */}
          <div className="bg-[#121215] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-violet-600/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Hypertrophy Training Suite</h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Log sets, reps, weight, and RPE with precision. Calculate estimated 1-rep maxes on the fly and never miss a beat with the built-in interval rest timer.
            </p>
            <div className="flex flex-col gap-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Smart Rest Timer with audio cues</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Push / Pull / Legs routine builder</span>
              </div>
            </div>
          </div>

          {/* Bento Card 4: Daily Streaks & Badges */}
          <div className="md:col-span-2 bg-[#121215] border border-zinc-800/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden group hover:border-violet-600/40 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-5">
              <Trophy className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Daily Consistency Streaks & Tiered Badges</h3>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-lg mb-6">
              Consistency is what builds physiques. WeGro gamifies your daily habit with streak fire counters, milestone achievements, and exportable high-resolution day summary cards.
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-zinc-300">
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">🔥 Active Streak Multiplier</span>
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">🥉 Bronze to Diamond Tiers</span>
              <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800">📸 Shareable Instagram Progress Cards</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Interactive Calorie & Macro Calculator (Immediate Engagement) */}
      <section id="calculator" className="relative z-10 py-14 sm:py-24 max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="bg-gradient-to-b from-[#141418] to-[#0e0e11] border border-violet-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center max-w-xl mx-auto mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">
              <Target className="w-3.5 h-3.5" />
              <span>Free Interactive Tool</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Calculate Your Daily Target in 10 Seconds
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Select your primary goal and weight to preview your optimal daily calorie and macro split.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Input Controls */}
            <div className="space-y-4">
              {/* Goal Selector */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">Fitness Goal</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcGoal("cut")}
                    className={`py-2.5 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer border text-center ${
                      calcGoal === "cut"
                        ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">Cut</span>
                    <span className="hidden sm:inline">Lose Fat (Cut)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcGoal("maintain")}
                    className={`py-2.5 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer border text-center ${
                      calcGoal === "maintain"
                        ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">Maintain</span>
                    <span className="hidden sm:inline">Maintain / Recomp</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcGoal("bulk")}
                    className={`py-2.5 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all cursor-pointer border text-center ${
                      calcGoal === "bulk"
                        ? "bg-violet-600 border-violet-500 text-white shadow-md shadow-violet-600/30"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">Bulk</span>
                    <span className="hidden sm:inline">Build Muscle</span>
                  </button>
                </div>
              </div>

              {/* Weight Input */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-bold text-zinc-300">Current Bodyweight</label>
                  <div className="flex bg-zinc-900 border border-zinc-800 rounded-lg p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setCalcUnit("kg")}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        calcUnit === "kg" ? "bg-violet-600 text-white" : "text-zinc-400"
                      }`}
                    >
                      KG
                    </button>
                    <button
                      type="button"
                      onClick={() => setCalcUnit("lbs")}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                        calcUnit === "lbs" ? "bg-violet-600 text-white" : "text-zinc-400"
                      }`}
                    >
                      LBS
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={calcUnit === "kg" ? 45 : 100}
                    max={calcUnit === "kg" ? 140 : 300}
                    value={calcWeight}
                    onChange={(e) => setCalcWeight(Number(e.target.value))}
                    className="w-full accent-violet-500 h-2 bg-zinc-800 rounded-lg cursor-pointer"
                  />
                  <span className="text-sm sm:text-base font-black text-white w-16 text-right font-mono shrink-0">
                    {calcWeight} {calcUnit}
                  </span>
                </div>
              </div>

              {/* Activity Level */}
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-2">Weekly Activity Level</label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setCalcActivity("light")}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border text-center ${
                      calcActivity === "light"
                        ? "bg-zinc-800 border-violet-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">1-2 days</span>
                    <span className="hidden sm:inline">1-2 workouts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcActivity("moderate")}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border text-center ${
                      calcActivity === "moderate"
                        ? "bg-zinc-800 border-violet-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">3-5 days</span>
                    <span className="hidden sm:inline">3-5 workouts</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCalcActivity("heavy")}
                    className={`py-2 px-1.5 sm:px-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all cursor-pointer border text-center ${
                      calcActivity === "heavy"
                        ? "bg-zinc-800 border-violet-500 text-white"
                        : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span className="sm:hidden">6+ days</span>
                    <span className="hidden sm:inline">6+ lifting/cardio</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Calculated Output Card */}
            <div className="bg-[#18181d] border border-zinc-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 flex flex-col justify-between space-y-4 sm:space-y-5">
              <div>
                <div className="text-[10px] sm:text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                  Recommended Daily Target
                </div>
                <div className="text-2xl sm:text-3xl font-black text-white mt-1 flex items-baseline gap-2">
                  <span>{targetCalories.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-400">kcal / day</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
                <div className="bg-zinc-900/90 p-2 sm:p-2.5 rounded-xl border border-rose-500/20">
                  <div className="text-[9px] sm:text-[10px] text-rose-400 font-bold">PROTEIN</div>
                  <div className="text-xs sm:text-sm font-black text-white mt-0.5">{targetProtein}g</div>
                </div>
                <div className="bg-zinc-900/90 p-2 sm:p-2.5 rounded-xl border border-amber-500/20">
                  <div className="text-[9px] sm:text-[10px] text-amber-400 font-bold">CARBS</div>
                  <div className="text-xs sm:text-sm font-black text-white mt-0.5">{targetCarbs}g</div>
                </div>
                <div className="bg-zinc-900/90 p-2 sm:p-2.5 rounded-xl border border-emerald-500/20">
                  <div className="text-[9px] sm:text-[10px] text-emerald-400 font-bold">FATS</div>
                  <div className="text-xs sm:text-sm font-black text-white mt-0.5">{targetFat}g</div>
                </div>
              </div>

              <button
                type="button"
                onClick={onGetStarted}
                className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-violet-600/30 transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>Save & Track in WeGro (Free)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Comparison Table: WeGro vs Other Apps */}
      <section id="comparison" className="relative z-10 py-14 sm:py-24 max-w-5xl mx-auto px-3.5 sm:px-6">
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Honest Breakdown</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Why Lifters Choose WeGro</h2>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1.5">
            See how WeGro compares to traditional bloated fitness applications.
          </p>
        </div>

        <div className="bg-[#121215] border border-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
          <div className="sm:hidden text-center py-2 text-[10px] text-zinc-400 bg-zinc-900/50 border-b border-zinc-800">
            ← Swipe sideways to compare all features →
          </div>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs sm:text-sm min-w-[460px]">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="py-3 px-3.5 sm:py-4 sm:px-5 font-bold text-zinc-400">Feature</th>
                  <th className="py-3 px-3.5 sm:py-4 sm:px-5 font-bold text-zinc-400">Traditional Trackers</th>
                  <th className="py-3 px-3.5 sm:py-4 sm:px-5 font-black text-violet-400 bg-violet-950/20">WeGro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-300">
                <tr>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 font-medium text-white">Barcode Scanner</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-red-400">Locked behind $19.99/mo paywall</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-emerald-400 font-bold bg-violet-950/10">100% Free & Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 font-medium text-white">Ads & Promotional Popups</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-red-400">Frequent full-screen & banner ads</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-emerald-400 font-bold bg-violet-950/10">Zero Ads, Ever</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 font-medium text-white">Hypertrophy Logging + Timer</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-zinc-400">Requires a separate paid app</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-emerald-400 font-bold bg-violet-950/10">Integrated in one tab</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 font-medium text-white">Offline Performance</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-red-400">Freezes or blocks without cell data</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-emerald-400 font-bold bg-violet-950/10">Offline-first local sync</td>
                </tr>
                <tr>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 font-medium text-white">Installation & Storage</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-zinc-400">150MB+ download from App Store</td>
                  <td className="py-3 px-3.5 sm:py-4 sm:px-5 text-emerald-400 font-bold bg-violet-950/10">Instant 1-tap PWA install</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 7. PWA / Mobile Install Section & Desktop QR */}
      <section id="pwa" className="relative z-10 py-14 sm:py-24 max-w-6xl mx-auto px-3.5 sm:px-6">
        <div className="bg-gradient-to-r from-violet-950/30 via-[#121216] to-[#121216] border border-violet-500/30 rounded-2xl sm:rounded-3xl p-4 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
            {/* Left: Info & Mobile Instructions */}
            <div className="space-y-4 sm:space-y-5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-400">
                <Smartphone className="w-3.5 h-3.5" />
                <span>Next-Gen Mobile App</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Works in Browser, Feels Like Native iOS & Android
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Add WeGro directly to your phone's home screen. Enjoy full-screen immersion, 60fps animations, haptic feedback, and instant startup without going through an app store.
              </p>

              <div className="space-y-2.5 sm:space-y-3 pt-1 sm:pt-2 text-xs">
                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-white shrink-0 mt-0.5">
                    🍎
                  </div>
                  <div>
                    <div className="font-bold text-white">On iPhone / iPad (Safari)</div>
                    <div className="text-zinc-400 mt-0.5 leading-relaxed">
                      Tap the <span className="text-violet-400 font-semibold">Share</span> icon at the bottom, then scroll down and tap <span className="text-violet-400 font-semibold">"Add to Home Screen"</span>.
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-white shrink-0 mt-0.5">
                    🤖
                  </div>
                  <div>
                    <div className="font-bold text-white">On Android (Chrome)</div>
                    <div className="text-zinc-400 mt-0.5 leading-relaxed">
                      Tap the three-dot menu icon, then select <span className="text-violet-400 font-semibold">"Install App"</span> or <span className="text-violet-400 font-semibold">"Add to Home screen"</span>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Mobile Quick Launch on small screens, QR Code on larger screens */}
            {/* Mobile View */}
            <div className="lg:hidden bg-[#18181d] border border-zinc-800 rounded-2xl p-4 sm:p-6 flex flex-col items-center text-center space-y-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600/10 border border-violet-500/30 flex items-center justify-center text-violet-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">You're Viewing on Mobile</h3>
                <p className="text-xs text-zinc-400 mt-0.5">Start tracking right now in your browser, or bookmark it to your home screen.</p>
              </div>
              <div className="flex w-full gap-2 pt-1">
                <button
                  type="button"
                  onClick={onGetStarted}
                  className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition-colors cursor-pointer"
                >
                  Start Tracking Free
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-medium transition-colors cursor-pointer whitespace-nowrap"
                >
                  {copiedLink ? "Copied!" : "Copy URL"}
                </button>
              </div>
            </div>

            {/* Desktop View: Scan QR Code with Phone */}
            <div className="hidden lg:flex bg-[#18181d] border border-zinc-800 rounded-3xl p-6 sm:p-8 flex-col items-center text-center space-y-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400">
                <QrCode className="w-4 h-4" />
                <span>Open On Mobile Instantly</span>
              </div>

              {/* QR Code Graphic (SVG based, guaranteed offline render) */}
              <div className="p-4 bg-white rounded-2xl shadow-xl flex items-center justify-center relative">
                {/* Clean Vector QR pattern representation */}
                <svg
                  className="w-44 h-44"
                  viewBox="0 0 256 256"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Position detection corners */}
                  {/* Top-Left */}
                  <rect x="16" y="16" width="64" height="64" rx="8" fill="#09090b" />
                  <rect x="28" y="28" width="40" height="40" rx="4" fill="white" />
                  <rect x="36" y="36" width="24" height="24" rx="2" fill="#7c3aed" />

                  {/* Top-Right */}
                  <rect x="176" y="16" width="64" height="64" rx="8" fill="#09090b" />
                  <rect x="188" y="28" width="40" height="40" rx="4" fill="white" />
                  <rect x="196" y="36" width="24" height="24" rx="2" fill="#7c3aed" />

                  {/* Bottom-Left */}
                  <rect x="16" y="176" width="64" height="64" rx="8" fill="#09090b" />
                  <rect x="28" y="188" width="40" height="40" rx="4" fill="white" />
                  <rect x="36" y="196" width="24" height="24" rx="2" fill="#7c3aed" />

                  {/* Data Blocks Grid */}
                  <rect x="96" y="20" width="16" height="16" fill="#09090b" />
                  <rect x="124" y="20" width="16" height="16" fill="#7c3aed" />
                  <rect x="144" y="36" width="16" height="16" fill="#09090b" />
                  <rect x="96" y="56" width="16" height="16" fill="#09090b" />
                  <rect x="124" y="56" width="16" height="16" fill="#09090b" />

                  {/* Middle Column */}
                  <rect x="20" y="96" width="16" height="16" fill="#09090b" />
                  <rect x="48" y="112" width="16" height="16" fill="#7c3aed" />
                  <rect x="76" y="96" width="16" height="16" fill="#09090b" />
                  <rect x="96" y="96" width="64" height="64" rx="12" fill="#09090b" />
                  <circle cx="128" cy="128" r="14" fill="#8b5cf6" />
                  <rect x="176" y="96" width="16" height="16" fill="#09090b" />
                  <rect x="208" y="112" width="16" height="16" fill="#7c3aed" />

                  {/* Bottom Area */}
                  <rect x="96" y="176" width="16" height="16" fill="#7c3aed" />
                  <rect x="124" y="196" width="16" height="16" fill="#09090b" />
                  <rect x="144" y="176" width="16" height="16" fill="#09090b" />
                  <rect x="176" y="176" width="16" height="16" fill="#09090b" />
                  <rect x="208" y="196" width="16" height="16" fill="#7c3aed" />
                  <rect x="188" y="220" width="16" height="16" fill="#09090b" />
                </svg>
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-white">Scan with your smartphone camera</p>
                <p className="text-[11px] text-zinc-400">Instantly opens WeGro on your device</p>
              </div>

              {/* Copy URL button */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-medium text-zinc-300 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied!" : "Copy Web URL"}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Frequently Asked Questions */}
      <section id="faq" className="relative z-10 py-16 sm:py-24 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-violet-400 mb-2">
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="bg-[#121215] border border-zinc-800 rounded-2xl overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between text-white font-bold text-sm sm:text-base cursor-pointer hover:text-violet-300 transition-colors"
                >
                  <span>{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-200 shrink-0 ml-4 ${
                      isOpen ? "rotate-180 text-violet-400" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-0 text-xs sm:text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/40">
                    <p className="mt-3">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 9. Final High-Impact CTA Banner */}
      <section className="relative z-10 py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center">
        <div className="relative bg-gradient-to-r from-violet-900/40 via-purple-900/30 to-fuchsia-900/40 border border-violet-500/40 rounded-3xl p-8 sm:p-14 shadow-2xl overflow-hidden">
          <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-20 blur-2xl pointer-events-none" />

          <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Ready to Upgrade Your Training & Nutrition?
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              No credit card required. No 7-day trials. Join WeGro today and experience what fitness tracking should have been all along.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-white hover:bg-zinc-100 text-black font-extrabold text-sm shadow-xl shadow-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Create Your Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onSignIn}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Footer */}
      <footer className="relative z-10 border-t border-zinc-800/80 bg-[#070709] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <WeGroLogo size="sm" />
            <div>
              <div className="text-sm font-black text-white">WeGro</div>
              <div className="text-[11px] text-zinc-500">Track today. Grow tomorrow.</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-xs text-zinc-400">
            <a href="#features" className="hover:text-white transition-colors">
              Features
            </a>
            <a href="#preview" className="hover:text-white transition-colors">
              Preview
            </a>
            <a href="#calculator" className="hover:text-white transition-colors">
              Calculator
            </a>
            <a href="#pwa" className="hover:text-white transition-colors">
              PWA Install
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
          </div>

          <div className="text-xs text-zinc-500 text-center sm:text-right">
            © {new Date().getFullYear()} WeGro. Precision Fitness Intelligence.
          </div>
        </div>
      </footer>
    </div>
  );
}
