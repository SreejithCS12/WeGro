"use client";

import { Droplets, Plus } from "lucide-react";

interface HydrationCardProps {
  waterConsumed: number;
  waterTarget: number;
  onQuickAdd: (ml: number) => void;
  onOpenWaterModal: () => void;
}

export function HydrationCard({
  waterConsumed,
  waterTarget,
  onQuickAdd,
  onOpenWaterModal,
}: HydrationCardProps) {
  const percentage = Math.min(100, Math.round((waterConsumed / waterTarget) * 100)) || 0;
  const remaining = Math.max(0, waterTarget - waterConsumed);

  return (
    <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/10 text-sky-400">
            <Droplets className="w-4 h-4" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Hydration
          </span>
        </div>
        <button
          onClick={onOpenWaterModal}
          className="text-xs font-medium text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
        >
          <span>Logs</span>
        </button>
      </div>

      <div className="flex items-baseline justify-between mb-2">
        <div>
          <span className="text-2xl font-extrabold font-mono text-white">
            {waterConsumed.toLocaleString()}
          </span>
          <span className="text-xs text-zinc-400 ml-1">/ {waterTarget.toLocaleString()} ml</span>
        </div>
        <span className="text-xs font-bold font-mono text-sky-400">
          {percentage}% {remaining > 0 ? `(${remaining}ml left)` : "✓ Goal Met"}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-blue-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Quick Add Pills */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onQuickAdd(250)}
          className="flex-1 py-1.5 px-3 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-sky-500/50 hover:bg-zinc-800 active:scale-95 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          <span>250 ml</span>
        </button>
        <button
          onClick={() => onQuickAdd(500)}
          className="flex-1 py-1.5 px-3 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-sky-500/50 hover:bg-zinc-800 active:scale-95 text-xs font-semibold text-zinc-200 transition-all flex items-center justify-center gap-1"
        >
          <Plus className="w-3.5 h-3.5 text-sky-400" />
          <span>500 ml</span>
        </button>
        <button
          onClick={onOpenWaterModal}
          className="py-1.5 px-3 rounded-xl bg-[#18181b] border border-[#27272a] hover:border-zinc-600 text-xs text-zinc-400 hover:text-zinc-200"
          title="Custom amount"
        >
          Custom
        </button>
      </div>
    </div>
  );
}
