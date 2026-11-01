"use client";

import { useState } from "react";
import {
  Trophy,
  Flame,
  Zap,
  Dumbbell,
  Droplet,
  Shield,
  Scale,
  Sparkles,
  Utensils,
  Target,
  Lock,
  CheckCircle2,
  Share2,
  X,
  ChevronRight,
} from "lucide-react";
import {
  MilestoneBadge,
  MilestoneSummary,
  BadgeCategory,
  BadgeTier,
} from "@/lib/data/badges";
import { cn } from "@/lib/utils";

interface MilestoneBadgesCardProps {
  summary: MilestoneSummary;
}

const TIER_COLORS: Record<
  BadgeTier,
  {
    border: string;
    bg: string;
    glow: string;
    text: string;
    pill: string;
  }
> = {
  bronze: {
    border: "border-amber-700/50",
    bg: "from-amber-950/30 to-amber-900/10",
    glow: "shadow-amber-900/20",
    text: "text-amber-400",
    pill: "bg-amber-950/60 text-amber-300 border-amber-700/40",
  },
  silver: {
    border: "border-zinc-400/50",
    bg: "from-zinc-800/40 to-zinc-900/10",
    glow: "shadow-zinc-700/20",
    text: "text-zinc-200",
    pill: "bg-zinc-800 text-zinc-200 border-zinc-600/50",
  },
  gold: {
    border: "border-yellow-500/60",
    bg: "from-yellow-950/40 via-amber-900/20 to-black/30",
    glow: "shadow-yellow-500/20",
    text: "text-yellow-400",
    pill: "bg-yellow-950/60 text-yellow-300 border-yellow-600/50",
  },
  platinum: {
    border: "border-cyan-400/60",
    bg: "from-cyan-950/40 via-blue-900/20 to-black/30",
    glow: "shadow-cyan-500/20",
    text: "text-cyan-300",
    pill: "bg-cyan-950/60 text-cyan-300 border-cyan-500/50",
  },
  diamond: {
    border: "border-fuchsia-400/60",
    bg: "from-fuchsia-950/50 via-purple-900/25 to-black/30",
    glow: "shadow-fuchsia-500/25",
    text: "text-fuchsia-300",
    pill: "bg-fuchsia-950/60 text-fuchsia-200 border-fuchsia-500/50",
  },
};

function renderBadgeIcon(iconType: MilestoneBadge["iconType"], className = "w-5 h-5") {
  switch (iconType) {
    case "flame":
      return <Flame className={className} />;
    case "zap":
      return <Zap className={className} />;
    case "trophy":
      return <Trophy className={className} />;
    case "dumbbell":
      return <Dumbbell className={className} />;
    case "droplet":
      return <Droplet className={className} />;
    case "shield":
      return <Shield className={className} />;
    case "scale":
      return <Scale className={className} />;
    case "sparkles":
      return <Sparkles className={className} />;
    case "utensils":
      return <Utensils className={className} />;
    case "target":
    default:
      return <Target className={className} />;
  }
}

export function MilestoneBadgesCard({ summary }: MilestoneBadgesCardProps) {
  const [activeFilter, setActiveFilter] = useState<
    "all" | "unlocked" | "streak" | "nutrition" | "iron" | "body"
  >("all");
  const [selectedBadge, setSelectedBadge] = useState<MilestoneBadge | null>(null);
  const [copiedShare, setCopiedShare] = useState(false);

  const filteredBadges = summary.badges.filter((b) => {
    if (activeFilter === "unlocked") return b.isUnlocked;
    if (activeFilter === "all") return true;
    return b.category === activeFilter;
  });

  const completionPercent = Math.round(
    (summary.unlockedCount / Math.max(1, summary.totalCount)) * 100
  );

  const handleShareBadge = (badge: MilestoneBadge) => {
    const text = `🏆 Unlocked Milestone on WeGro: ${badge.title}!\n"${badge.description}"\nTrack today. Grow tomorrow.`;
    if (navigator.share) {
      navigator.share({
        title: `WeGro Milestone: ${badge.title}`,
        text,
        url: window.location.origin,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="bg-[#141417] border border-[#27272a] rounded-2xl p-4 sm:p-5 shadow-xl space-y-5">
      {/* Header with Master Progress */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-600/20 text-yellow-400 border border-yellow-500/30 shadow-md shadow-yellow-500/10">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Milestones & Badges
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                {summary.unlockedCount} / {summary.totalCount}
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              Earn trophies for workout volume, consistency streaks & fuel targets
            </p>
          </div>
        </div>

        {/* Lifetime Stats Quick Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="bg-[#18181b] border border-[#27272a] px-2.5 py-1.5 rounded-xl shrink-0">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Total Volume</span>
            <span className="text-xs font-mono font-bold text-violet-400">
              {summary.totalVolumeKg.toLocaleString()} kg
            </span>
          </div>
          <div className="bg-[#18181b] border border-[#27272a] px-2.5 py-1.5 rounded-xl shrink-0">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block">Peak Protein</span>
            <span className="text-xs font-mono font-bold text-emerald-400">
              {summary.highestProteinGrams} g
            </span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-zinc-400">Hall of Fame Mastery</span>
          <span className="text-violet-400 font-mono">{completionPercent}%</span>
        </div>
        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-amber-400 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar border-b border-[#27272a] -mx-1 px-1">
        {[
          { id: "all", label: `All (${summary.totalCount})` },
          { id: "unlocked", label: `Unlocked (${summary.unlockedCount})` },
          { id: "streak", label: "Streaks 🔥" },
          { id: "nutrition", label: "Nutrition 🥩" },
          { id: "iron", label: "Iron 🏋️‍♂️" },
          { id: "body", label: "Body ⚖️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
              activeFilter === tab.id
                ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                : "bg-[#18181b] text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border border-[#27272a]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredBadges.map((badge) => {
          const tierStyle = TIER_COLORS[badge.tier];

          return (
            <div
              key={badge.id}
              onClick={() => setSelectedBadge(badge)}
              className={cn(
                "relative group p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden",
                badge.isUnlocked
                  ? cn(
                      "bg-gradient-to-br",
                      tierStyle.bg,
                      tierStyle.border,
                      tierStyle.glow,
                      "hover:scale-[1.02] shadow-lg"
                    )
                  : "bg-[#18181b]/70 border-[#27272a] hover:border-zinc-700 opacity-75 hover:opacity-90"
              )}
            >
              {/* Top Row: Icon + Tier Pill */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className={cn(
                    "p-2.5 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-110",
                    badge.isUnlocked
                      ? cn("bg-black/40", tierStyle.border, tierStyle.text)
                      : "bg-zinc-900/80 border-zinc-800 text-zinc-500"
                  )}
                >
                  {renderBadgeIcon(badge.iconType, "w-5 h-5")}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                      tierStyle.pill
                    )}
                  >
                    {badge.tier}
                  </span>

                  {badge.isUnlocked ? (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="p-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {/* Middle: Title & Description */}
              <div className="space-y-1 mb-3">
                <h4
                  className={cn(
                    "text-xs font-bold tracking-tight",
                    badge.isUnlocked ? "text-white" : "text-zinc-300"
                  )}
                >
                  {badge.title}
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed line-clamp-2">
                  {badge.description}
                </p>
              </div>

              {/* Bottom: Progress or Unlocked Banner */}
              <div className="pt-2 border-t border-white/5">
                {badge.isUnlocked ? (
                  <div className="flex items-center justify-between text-[11px] font-semibold text-emerald-400">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Completed
                    </span>
                    <span className="font-mono text-zinc-400 text-[10px]">
                      {badge.targetValue.toLocaleString()} {badge.unit}
                    </span>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>
                        {badge.currentValue.toLocaleString()} / {badge.targetValue.toLocaleString()}{" "}
                        {badge.unit}
                      </span>
                      <span className="font-bold text-zinc-300">
                        {badge.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-zinc-500 rounded-full"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className="text-center py-8 text-zinc-500 text-xs">
          No badges found in this category.
        </div>
      )}

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-sm p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBadge(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Emblem Center */}
            <div className="text-center space-y-3 pt-2">
              <div
                className={cn(
                  "w-20 h-20 mx-auto rounded-3xl border flex items-center justify-center shadow-xl relative",
                  selectedBadge.isUnlocked
                    ? cn(
                        "bg-gradient-to-br",
                        TIER_COLORS[selectedBadge.tier].bg,
                        TIER_COLORS[selectedBadge.tier].border,
                        TIER_COLORS[selectedBadge.tier].glow
                      )
                    : "bg-zinc-900 border-zinc-800 text-zinc-600"
                )}
              >
                {renderBadgeIcon(
                  selectedBadge.iconType,
                  cn(
                    "w-10 h-10",
                    selectedBadge.isUnlocked
                      ? TIER_COLORS[selectedBadge.tier].text
                      : "text-zinc-500"
                  )
                )}
                {selectedBadge.isUnlocked && (
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-black shadow-md">
                    <CheckCircle2 className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div>
                <span
                  className={cn(
                    "px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-widest border inline-block mb-1.5",
                    TIER_COLORS[selectedBadge.tier].pill
                  )}
                >
                  {selectedBadge.tier} Milestone
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  {selectedBadge.title}
                </h3>
              </div>
            </div>

            {/* Description & Requirements */}
            <div className="bg-[#18181b] border border-[#27272a] p-3.5 rounded-2xl space-y-2 text-xs">
              <p className="text-zinc-300 leading-relaxed text-center">
                {selectedBadge.description}
              </p>
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Requirement:</span>
                <span className="font-mono font-bold text-white">
                  {selectedBadge.targetValue.toLocaleString()} {selectedBadge.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Your Current Record:</span>
                <span
                  className={cn(
                    "font-mono font-bold",
                    selectedBadge.isUnlocked ? "text-emerald-400" : "text-violet-400"
                  )}
                >
                  {selectedBadge.currentValue.toLocaleString()} {selectedBadge.unit}
                </span>
              </div>
            </div>

            {/* Progress Bar in Modal */}
            {!selectedBadge.isUnlocked && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-400">
                  <span>Current Progress</span>
                  <span className="font-mono text-white">
                    {selectedBadge.progressPercent}%
                  </span>
                </div>
                <div className="w-full h-2.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
                    style={{ width: `${selectedBadge.progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2">
              {selectedBadge.isUnlocked && (
                <button
                  onClick={() => handleShareBadge(selectedBadge)}
                  className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/30 active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>{copiedShare ? "Copied to Clipboard!" : "Share Milestone"}</span>
                </button>
              )}

              <button
                onClick={() => setSelectedBadge(null)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-semibold text-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
