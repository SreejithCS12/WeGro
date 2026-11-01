"use client";

import { LayoutDashboard, Dumbbell, Utensils, TrendingUp, Settings } from "lucide-react";
import { cn, scrollToTop } from "@/lib/utils";

export type NavTab = "dashboard" | "workouts" | "nutrition" | "progress" | "settings";

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveWorkout?: boolean;
}

export function BottomNav({
  currentTab,
  onTabChange,
  hasActiveWorkout = false,
}: BottomNavProps) {
  const tabs = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "workouts" as const, label: "Workouts", icon: Dumbbell, hasBadge: hasActiveWorkout },
    { id: "nutrition" as const, label: "Nutrition", icon: Utensils },
    { id: "progress" as const, label: "Progress", icon: TrendingUp },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#09090b]/95 backdrop-blur-lg border-t border-[#27272a] px-2 py-1.5 safe-area-bottom">
      <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (isActive) {
                  scrollToTop(true);
                } else {
                  onTabChange(tab.id);
                  scrollToTop(false);
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-150 select-none",
                isActive
                  ? "text-violet-400 font-semibold"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <div className="relative">
                <Icon
                  className={cn(
                    "w-5 h-5 transition-transform",
                    isActive && "scale-110 text-violet-400"
                  )}
                />
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-violet-500 rounded-full animate-ping" />
                )}
                {tab.hasBadge && (
                  <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 bg-violet-500 rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 w-6 h-0.5 bg-violet-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
