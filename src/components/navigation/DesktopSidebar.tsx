"use client";

import {
  LayoutDashboard,
  Dumbbell,
  Utensils,
  TrendingUp,
  Settings,
  Play,
  Flame,
  Cloud,
  CloudOff,
  RefreshCw,
  LogOut,
  Sparkles,
} from "lucide-react";
import { NavTab } from "@/components/navigation/BottomNav";
import { WeGroLogo } from "@/components/ui/WeGroLogo";
import { cn, scrollToTop } from "@/lib/utils";
import { SyncQueueState } from "@/lib/services/sync-queue";

interface DesktopSidebarProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  hasActiveWorkout?: boolean;
  userName: string;
  calorieTarget?: number;
  onStartWorkout?: () => void;
  authUser?: any | null;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  syncQueueState?: SyncQueueState;
  onTriggerSyncNow?: () => void;
}

export function DesktopSidebar({
  currentTab,
  onTabChange,
  hasActiveWorkout = false,
  userName,
  calorieTarget = 2400,
  onStartWorkout,
  authUser,
  onOpenAuth,
  onSignOut,
  syncQueueState,
  onTriggerSyncNow,
}: DesktopSidebarProps) {
  const navItems = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    {
      id: "workouts" as const,
      label: "Workouts",
      icon: Dumbbell,
      hasBadge: hasActiveWorkout,
      badgeText: "Active",
    },
    { id: "nutrition" as const, label: "Nutrition", icon: Utensils },
    { id: "progress" as const, label: "Progress & Stats", icon: TrendingUp },
    { id: "settings" as const, label: "Settings", icon: Settings },
  ];

  return (
    <aside className="hidden lg:flex w-72 bg-[#0c0c0e] border-r border-[#27272a] flex-col justify-between p-5 shrink-0 sticky top-0 h-screen select-none">
      <div className="space-y-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3 px-1">
          <WeGroLogo size="md" />
          <div className="min-w-0">
            <h1 className="text-base font-extrabold text-white tracking-tight">WeGro</h1>
            <p className="text-[11px] text-zinc-400 font-medium whitespace-nowrap">
              Track today. Grow tomorrow!
            </p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1.5">
          <div className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 px-3 py-1">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (isActive) {
                    scrollToTop(true);
                  } else {
                    onTabChange(item.id);
                    scrollToTop(false);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group",
                  isActive
                    ? "bg-violet-600/15 text-violet-300 border border-violet-500/30 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-transform group-hover:scale-110",
                      isActive ? "text-violet-400" : "text-zinc-400 group-hover:text-zinc-200"
                    )}
                  />
                  <span>{item.label}</span>
                </div>

                {item.hasBadge && (
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/20 text-violet-400 border border-violet-500/40 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                    <span>{item.badgeText}</span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Action Workout Button */}
        {onStartWorkout && (
          <div className="pt-2">
            <button
              onClick={onStartWorkout}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg shadow-violet-600/25 transition-all active:scale-[0.98]"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{hasActiveWorkout ? "Resume Session" : "Quick Workout"}</span>
            </button>
          </div>
        )}
      </div>

      {/* User Profile & Cloud Sync Card at bottom of sidebar */}
      <div className="space-y-2">
        {!authUser && onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="w-full py-2 px-3 rounded-xl bg-violet-950/40 hover:bg-violet-900/50 border border-violet-500/30 text-violet-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 text-violet-400 group-hover:rotate-12 transition-transform" />
            <span>Sign In / Cloud Sync</span>
          </button>
        )}

        <div className="p-3 bg-[#141417] hover:bg-[#18181b] rounded-xl border border-[#27272a] hover:border-violet-500/40 transition-all flex items-center justify-between group">
          <div
            onClick={() => onTabChange("settings")}
            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
          >
            <div className="w-8 h-8 rounded-full bg-violet-600/30 text-violet-400 border border-violet-500/40 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0">
              {userName ? userName.charAt(0).toUpperCase() : "U"}
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="text-xs font-semibold text-zinc-100 group-hover:text-violet-300 transition-colors truncate">
                {userName || "Sreejith"}
              </div>
              <div className="text-[10px] text-zinc-400 flex items-center gap-1.5 truncate">
                {syncQueueState?.isSyncing ? (
                  <span className="text-blue-400 flex items-center gap-1 font-medium animate-pulse">
                    <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                    Syncing...
                  </span>
                ) : syncQueueState && !syncQueueState.isOnline ? (
                  <span className="text-amber-400 flex items-center gap-1 font-medium">
                    <CloudOff className="w-2.5 h-2.5" />
                    Offline {syncQueueState.pendingCount > 0 ? `(${syncQueueState.pendingCount})` : ""}
                  </span>
                ) : syncQueueState && syncQueueState.pendingCount > 0 ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTriggerSyncNow?.();
                    }}
                    className="text-violet-400 hover:text-violet-300 flex items-center gap-1 font-medium underline"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Sync ({syncQueueState.pendingCount})
                  </button>
                ) : authUser ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Cloud Synced
                  </span>
                ) : (
                  <span>Guest (Local)</span>
                )}
                <span>•</span>
                <span>{calorieTarget.toLocaleString()} kcal</span>
              </div>
            </div>
          </div>

          {authUser && onSignOut ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSignOut();
              }}
              title="Sign Out"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors ml-2 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          ) : (
            <span
              className={cn(
                "w-2 h-2 rounded-full shrink-0 ml-2",
                authUser ? "bg-emerald-400 shadow-sm shadow-emerald-400/50" : "bg-amber-400"
              )}
              title={authUser ? "Cloud Synced" : "Local Storage"}
            />
          )}
        </div>
      </div>
    </aside>
  );
}
