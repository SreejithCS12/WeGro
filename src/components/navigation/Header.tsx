"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Plus,
  Play,
  Droplets,
  LayoutDashboard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Settings,
  Sparkles,
} from "lucide-react";
import { formatDisplayDate, formatDateToISO } from "@/lib/utils";
import { NavTab } from "@/components/navigation/BottomNav";
import { WeGroLogo } from "@/components/ui/WeGroLogo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  userName: string;
  onOpenProfile: () => void;
  currentTab?: NavTab;
  onTabChange?: (tab: NavTab) => void;
  hasActiveWorkout?: boolean;
  onQuickAddFood?: () => void;
  onQuickAddWater?: () => void;
  onQuickStartWorkout?: () => void;
  authUser?: any | null;
  onOpenAuth?: () => void;
}

export function Header({
  currentDate,
  onDateChange,
  userName,
  onOpenProfile,
  currentTab = "dashboard",
  onTabChange,
  hasActiveWorkout = false,
  onQuickAddFood,
  onQuickAddWater,
  onQuickStartWorkout,
  authUser,
  onOpenAuth,
}: HeaderProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const handlePrevDay = () => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() - 1);
    onDateChange(formatDateToISO(date));
  };

  const handleNextDay = () => {
    const [y, m, d] = currentDate.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    date.setDate(date.getDate() + 1);
    onDateChange(formatDateToISO(date));
  };

  const handleSetToday = () => {
    onDateChange(formatDateToISO(new Date()));
  };

  const tabletTabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    {
      id: "workouts" as const,
      label: "Workouts",
      icon: Dumbbell,
      hasBadge: hasActiveWorkout,
    },
    { id: "nutrition" as const, label: "Nutrition", icon: Utensils },
    { id: "progress" as const, label: "Progress", icon: TrendingUp },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a] px-4 md:px-6 py-2.5 sm:py-3">
      <div className="w-full max-w-lg md:max-w-4xl lg:max-w-7xl mx-auto flex items-center justify-between gap-3 relative">
        {/* App Title & Identity (Visible on Mobile & Tablet, Hidden on Desktop where Sidebar is present) */}
        <div className="flex items-center gap-2.5 lg:hidden shrink-0">
          <WeGroLogo size="sm" />
          <h1 className="text-base font-extrabold text-white leading-tight tracking-tight">
            WeGro
          </h1>
        </div>

        {/* Date Navigator (Dead-centered relative to screen on mobile to align with Dynamic Island, static on desktop) */}
        <div className="md:static md:translate-x-0 absolute left-1/2 -translate-x-1/2 flex items-center bg-[#18181b] border border-[#27272a] rounded-full px-2 py-1 shadow-sm shrink-0 z-10">
          <button
            onClick={handlePrevDay}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Previous Day"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDatePickerOpen(true)}
            className="px-2 text-xs font-semibold text-zinc-200 hover:text-violet-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Click to jump to date"
          >
            <Calendar className="w-3.5 h-3.5 text-violet-400" />
            <span>{formatDisplayDate(currentDate)}</span>
          </button>

          <button
            onClick={handleNextDay}
            className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            title="Next Day"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Tablet Horizontal Tab Switcher (Visible ONLY on Tablet: md to lg) */}
        {onTabChange && (
          <div className="hidden md:flex lg:hidden items-center bg-[#141417] p-1 rounded-xl border border-[#27272a] shrink-0">
            {tabletTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  title={tab.label}
                  className={cn(
                    "relative flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all select-none",
                    isActive
                      ? "bg-violet-600 text-white shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40"
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className={cn(isActive ? "inline" : "hidden min-[920px]:inline")}>
                    {tab.label}
                  </span>
                  {tab.hasBadge && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse ml-0.5" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Desktop Quick Shortcuts (Visible ONLY on Desktop: lg+) */}
        <div className="hidden lg:flex items-center gap-2">
          {onQuickAddFood && (
            <button
              onClick={onQuickAddFood}
              className="px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-violet-500/40 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-violet-400" />
              <span>Log Food</span>
            </button>
          )}

          {onQuickAddWater && (
            <button
              onClick={onQuickAddWater}
              className="px-3 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-sky-500/40 text-xs font-medium text-zinc-200 flex items-center gap-1.5 transition-all"
            >
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>+250ml Water</span>
            </button>
          )}

          {onQuickStartWorkout && (
            <button
              onClick={onQuickStartWorkout}
              className="px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-violet-600/30"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{hasActiveWorkout ? "Resume Session" : "Start Workout"}</span>
            </button>
          )}
        </div>

        {/* Profile / Auth Area (Visible on Mobile & Tablet, compact on Desktop) */}
        <div className="flex items-center gap-2 shrink-0">
          {!authUser && onOpenAuth && (
            <button
              onClick={onOpenAuth}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/30 text-violet-200 text-xs font-semibold transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={onOpenProfile}
            className="shrink-0 flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#18181b] border border-[#27272a] hover:border-violet-500/50 hover:bg-zinc-800 transition-all text-xs text-zinc-200 cursor-pointer"
            title={`Profile: ${userName}${authUser ? " (Cloud Synced)" : " (Guest)"}`}
          >
            <div className="relative w-6 h-6 rounded-full bg-violet-600/30 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold text-xs">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
              {authUser && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#18181b]" />
              )}
            </div>
            <span className="hidden xl:inline font-medium">{userName}</span>
          </button>
        </div>
      </div>

      {/* Date Jump Picker Modal */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-2xl w-full max-w-xs p-4 space-y-3 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-violet-400">
                Jump to Date
              </h4>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="text-xs text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <input
              type="date"
              value={currentDate}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(e.target.value);
                  setIsDatePickerOpen(false);
                }
              }}
              className="w-full px-3 py-2 bg-[#18181b] border border-[#27272a] rounded-xl text-xs text-white outline-none focus:border-violet-500 font-mono"
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  handleSetToday();
                  setIsDatePickerOpen(false);
                }}
                className="flex-1 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 font-semibold transition"
              >
                Go to Today
              </button>
              <button
                onClick={() => setIsDatePickerOpen(false)}
                className="flex-1 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs text-white font-bold transition shadow-md shadow-violet-600/30"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
