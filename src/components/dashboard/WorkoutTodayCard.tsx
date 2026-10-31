"use client";

import { Dumbbell, Play, CheckCircle2 } from "lucide-react";
import { WorkoutSession } from "@/types/database";

interface WorkoutTodayCardProps {
  activeSession?: WorkoutSession | null;
  completedCount: number;
  isRestDay?: boolean;
  todayRoutineName?: string;
  onToggleRestDay?: () => void;
  onStartWorkout: () => void;
  onResumeWorkout: () => void;
  onDiscardWorkout: (sessionId: string) => void;
}

export function WorkoutTodayCard({
  activeSession,
  completedCount,
  isRestDay = false,
  todayRoutineName,
  onToggleRestDay,
  onStartWorkout,
  onResumeWorkout,
  onDiscardWorkout,
}: WorkoutTodayCardProps) {
  // 1. If an active session is in progress
  if (activeSession) {
    const completedSets = activeSession.sets?.filter((s) => s.is_completed).length || 0;
    const totalSets = activeSession.sets?.length || 0;

    return (
      <div className="bg-gradient-to-r from-violet-950/70 via-purple-900/40 to-[#141417] border border-violet-500/60 rounded-2xl p-4 shadow-xl relative overflow-hidden animate-pulse-subtle">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-violet-300">
              Workout In Progress
            </span>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {completedSets} / {totalSets} sets logged
          </span>
        </div>

        <h3 className="text-base font-bold text-white mb-3">{activeSession.name}</h3>

        <div className="flex items-center gap-2">
          <button
            onClick={onResumeWorkout}
            className="flex-1 py-2 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Resume Workout</span>
          </button>
          <button
            onClick={() => onDiscardWorkout(activeSession.id)}
            className="py-2 px-3 rounded-xl bg-zinc-900/80 hover:bg-red-950/50 hover:text-red-400 border border-zinc-700/60 text-xs text-zinc-400 transition-colors"
          >
            Discard
          </button>
        </div>
      </div>
    );
  }

  // 2. If day is marked as Rest Day or scheduled as Rest Day
  if (isRestDay || todayRoutineName === "Rest Day") {
    return (
      <div className="bg-[#141417] border border-emerald-500/40 rounded-2xl p-4 shadow-lg space-y-3 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">🛋️</span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
              Active Recovery
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onStartWorkout}
              className="py-1 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-medium text-zinc-300 transition-colors"
            >
              Train Today
            </button>
            {onToggleRestDay && (
              <button
                onClick={onToggleRestDay}
                className="text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-[#27272a] transition active:scale-95"
              >
                Undo Rest Day
              </button>
            )}
          </div>
        </div>
        <div className="text-center py-2 space-y-1">
          <div className="text-2xl">🛋️</div>
          <h4 className="text-sm font-bold text-emerald-400">Scheduled Recovery & Rest</h4>
          <p className="text-xs text-zinc-400 italic">
            "Muscles grow when you rest, not when you lift."
          </p>
        </div>
      </div>
    );
  }

  // 3. Normal Scheduled Workout Card
  return (
    <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
            <Dumbbell className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Today's Training
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onToggleRestDay && completedCount === 0 && (
            <button
              onClick={onToggleRestDay}
              className="text-[11px] font-semibold text-zinc-400 hover:text-white bg-zinc-800 px-2 py-0.5 rounded-lg border border-[#27272a] transition active:scale-95"
            >
              🛋️ Rest Day
            </button>
          )}
          {completedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{completedCount} Completed</span>
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">
            {completedCount > 0 ? "Great job today!" : todayRoutineName || "Push Day (Chest, Delts, Triceps)"}
          </h4>
          <p className="text-xs text-zinc-400">
            {completedCount > 0
              ? "Session recorded and volume saved."
              : "Pre-set planned exercises · Ready to start"}
          </p>
        </div>

        <button
          onClick={onStartWorkout}
          className="py-2 px-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-violet-600/30 active:scale-95"
        >
          <Play className="w-3.5 h-3.5 fill-white" />
          <span>{completedCount > 0 ? "Log Another" : "Start Session"}</span>
        </button>
      </div>
    </div>
  );
}
