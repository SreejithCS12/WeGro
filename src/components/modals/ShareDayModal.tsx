"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Share2,
  Download,
  Copy,
  Check,
  Flame,
  Dumbbell,
  Droplets,
  Calendar,
  Sparkles,
  Smartphone,
  Square,
  Award,
} from "lucide-react";
import { FitnessGoal, WorkoutSession } from "@/types/database";
import { formatCalories } from "@/lib/utils";

interface ShareDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  userName: string;
  dailyTotals: {
    caloriesConsumed: number;
    caloriesRemaining: number;
    proteinConsumed: number;
    carbsConsumed: number;
    fatConsumed: number;
    waterConsumed: number;
    completedWorkoutsCount: number;
    isRestDay: boolean;
    goal: FitnessGoal;
  };
  completedSessions: WorkoutSession[];
  streakDays: number;
}

export function ShareDayModal({
  isOpen,
  onClose,
  dateStr,
  userName,
  dailyTotals,
  completedSessions,
  streakDays,
}: ShareDayModalProps) {
  const [aspectMode, setAspectMode] = useState<"story" | "square">("story");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Formatted date string
  const formattedDate = (() => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      return new Date(y, m - 1, d).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  })();

  // Workout metrics calculation
  const totalSetsCount = completedSessions.reduce(
    (acc, s) => acc + (s.sets?.filter((st) => st.is_completed).length || 0),
    0
  );

  const totalVolumeKg = completedSessions.reduce(
    (acc, s) =>
      acc +
      (s.sets?.reduce(
        (stAcc, st) => (st.is_completed ? stAcc + st.reps * st.weight_kg : stAcc),
        0
      ) || 0),
    0
  );

  const mainWorkoutName =
    completedSessions.length > 0
      ? completedSessions.map((s) => s.name).join(" + ")
      : dailyTotals.isRestDay
      ? "Active Recovery & Rest"
      : "No Workout Logged";

  // Calorie & Hydration percentages
  const calorieTarget = dailyTotals.goal.calorie_target || 2000;
  const caloriePct = Math.min(150, Math.round((dailyTotals.caloriesConsumed / calorieTarget) * 100));
  const waterTarget = dailyTotals.goal.water_ml || 3000;
  const waterPct = Math.min(150, Math.round((dailyTotals.waterConsumed / waterTarget) * 100));

  /**
   * High-resolution canvas renderer
   * Generates a 1080x1920 (Story) or 1080x1080 (Square) retina graphic
   */
  const renderCardToCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const isStory = aspectMode === "story";
    const width = 1080;
    const height = isStory ? 1920 : 1080;

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // --- 1. Background with Deep Gradient & Ambient Glows ---
    const bgGradient = ctx.createLinearGradient(0, 0, width, height);
    bgGradient.addColorStop(0, "#09090b");
    bgGradient.addColorStop(0.5, "#100e17");
    bgGradient.addColorStop(1, "#09090b");
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, width, height);

    // Top-Right Radial Glow (Violet)
    const glow1 = ctx.createRadialGradient(width * 0.85, height * 0.15, 20, width * 0.85, height * 0.15, 600);
    glow1.addColorStop(0, "rgba(139, 92, 246, 0.22)");
    glow1.addColorStop(1, "rgba(139, 92, 246, 0)");
    ctx.fillStyle = glow1;
    ctx.fillRect(0, 0, width, height);

    // Bottom-Left Radial Glow (Emerald)
    const glow2 = ctx.createRadialGradient(width * 0.15, height * 0.85, 20, width * 0.15, height * 0.85, 600);
    glow2.addColorStop(0, "rgba(16, 185, 129, 0.15)");
    glow2.addColorStop(1, "rgba(16, 185, 129, 0)");
    ctx.fillStyle = glow2;
    ctx.fillRect(0, 0, width, height);

    // Helper: Rounded Rectangle with fill and border
    const drawGlassCard = (
      x: number,
      y: number,
      w: number,
      h: number,
      radius = 32,
      borderColor = "rgba(255, 255, 255, 0.08)",
      bgColor = "rgba(20, 20, 23, 0.7)"
    ) => {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, radius);
      ctx.fillStyle = bgColor;
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = borderColor;
      ctx.stroke();
      ctx.restore();
    };

    // --- 2. Header & Branding ---
    const startY = isStory ? 160 : 80;

    // WeGro App Pill Badge
    ctx.save();
    ctx.fillStyle = "rgba(139, 92, 246, 0.15)";
    ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(width / 2 - 130, startY, 260, 56, 28);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#a78bfa";
    ctx.font = "bold 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("⚡ WEGRO FITNESS", width / 2, startY + 36);
    ctx.restore();

    // Main Greeting / Title
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${userName}'s Daily Recap`, width / 2, startY + 125);

    // Subtitle Date + Streak Pill
    ctx.fillStyle = "#a1a1aa";
    ctx.font = "500 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(
      `${formattedDate}   ·   🔥 ${streakDays} Day Streak`,
      width / 2,
      startY + 175
    );

    // --- 3. Nutrition Card ---
    const cardMargin = 80;
    const cardWidth = width - cardMargin * 2;
    const nutritionY = startY + (isStory ? 240 : 210);
    const nutritionH = isStory ? 430 : 340;

    drawGlassCard(cardMargin, nutritionY, cardWidth, nutritionH, 40, "rgba(139, 92, 246, 0.25)");

    // Card Header
    ctx.fillStyle = "#e4e4e7";
    ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🥗 Daily Nutrition & Macros", cardMargin + 48, nutritionY + 65);

    ctx.fillStyle = "#a1a1aa";
    ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`${caloriePct}% of Goal`, cardMargin + cardWidth - 48, nutritionY + 65);

    // Calories Big Stat
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 76px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(formatCalories(dailyTotals.caloriesConsumed), cardMargin + 48, nutritionY + 160);

    ctx.fillStyle = "#71717a";
    ctx.font = "500 32px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.fillText(
      ` / ${formatCalories(calorieTarget)} kcal`,
      cardMargin + 48 + ctx.measureText(formatCalories(dailyTotals.caloriesConsumed)).width + 12,
      nutritionY + 160
    );

    // Calorie Progress Bar
    const barX = cardMargin + 48;
    const barY = nutritionY + 185;
    const barW = cardWidth - 96;
    const barH = 18;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(barX, barY, barW, barH, 9);
    ctx.fillStyle = "#27272a";
    ctx.fill();

    const filledW = Math.max(18, Math.min(barW, (barW * caloriePct) / 100));
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + filledW, barY);
    fillGrad.addColorStop(0, "#8b5cf6");
    fillGrad.addColorStop(1, "#d946ef");
    ctx.beginPath();
    ctx.roundRect(barX, barY, filledW, barH, 9);
    ctx.fillStyle = fillGrad;
    ctx.fill();
    ctx.restore();

    // 3 Macro Mini Cards
    const macroBoxY = barY + 40;
    const macroBoxW = (barW - 32) / 3;
    const macroBoxH = isStory ? 120 : 90;

    const macros = [
      {
        label: "Protein",
        val: `${Math.round(dailyTotals.proteinConsumed)}g`,
        sub: `Target ${dailyTotals.goal.protein_grams || 140}g`,
        color: "#f43f5e",
        border: "rgba(244, 63, 94, 0.25)",
      },
      {
        label: "Carbohydrates",
        val: `${Math.round(dailyTotals.carbsConsumed)}g`,
        sub: `Target ${dailyTotals.goal.carbs_grams || 220}g`,
        color: "#f59e0b",
        border: "rgba(245, 158, 11, 0.25)",
      },
      {
        label: "Fats",
        val: `${Math.round(dailyTotals.fatConsumed)}g`,
        sub: `Target ${dailyTotals.goal.fat_grams || 60}g`,
        color: "#10b981",
        border: "rgba(16, 185, 129, 0.25)",
      },
    ];

    macros.forEach((m, idx) => {
      const mX = barX + idx * (macroBoxW + 16);
      drawGlassCard(mX, macroBoxY, macroBoxW, macroBoxH, 20, m.border, "rgba(24, 24, 27, 0.5)");

      ctx.fillStyle = m.color;
      ctx.font = "bold 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(m.label, mX + 20, macroBoxY + 34);

      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(m.val, mX + 20, macroBoxY + 76);

      if (isStory) {
        ctx.fillStyle = "#71717a";
        ctx.font = "500 18px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
        ctx.fillText(m.sub, mX + 20, macroBoxY + 104);
      }
    });

    // --- 4. Workout Card ---
    const workoutY = nutritionY + nutritionH + 32;
    const workoutH = isStory ? 370 : 250;

    drawGlassCard(cardMargin, workoutY, cardWidth, workoutH, 40, "rgba(239, 68, 68, 0.25)");

    ctx.fillStyle = "#e4e4e7";
    ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("🏋️ Workout Session", cardMargin + 48, workoutY + 65);

    // Workout Routine Name
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 44px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(mainWorkoutName, cardMargin + 48, workoutY + 130);

    // Workout Metric Badges
    const wStatsY = workoutY + (isStory ? 175 : 155);
    const wStatW = (cardWidth - 96 - 32) / 3;
    const wStatH = isStory ? 140 : 75;

    const workoutStats = [
      {
        icon: "⏱️",
        label: "Duration",
        val:
          completedSessions.length > 0 && completedSessions[0].duration_seconds
            ? `${Math.round(completedSessions[0].duration_seconds / 60)}m`
            : dailyTotals.isRestDay
            ? "Rest"
            : "--",
      },
      {
        icon: "⚡",
        label: "Sets Finished",
        val: totalSetsCount > 0 ? `${totalSetsCount} sets` : dailyTotals.isRestDay ? "Recovery" : "--",
      },
      {
        icon: "🏆",
        label: "Volume Lifted",
        val: totalVolumeKg > 0 ? `${totalVolumeKg.toLocaleString()} kg` : dailyTotals.isRestDay ? "Rebuilding" : "--",
      },
    ];

    workoutStats.forEach((st, idx) => {
      const stX = cardMargin + 48 + idx * (wStatW + 16);
      drawGlassCard(stX, wStatsY, wStatW, wStatH, 20, "rgba(255, 255, 255, 0.05)", "rgba(24, 24, 27, 0.4)");

      ctx.fillStyle = "#a1a1aa";
      ctx.font = "500 20px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${st.icon} ${st.label}`, stX + 20, wStatsY + 36);

      ctx.fillStyle = "#f43f5e";
      ctx.font = "bold 36px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(st.val, stX + 20, wStatsY + 82);
    });

    // --- 5. Hydration & Streak Bar (Story Mode only for perfect balance) ---
    if (isStory) {
      const hydraY = workoutY + workoutH + 32;
      const hydraH = 260;

      drawGlassCard(cardMargin, hydraY, cardWidth, hydraH, 40, "rgba(14, 165, 233, 0.25)");

      ctx.fillStyle = "#e4e4e7";
      ctx.font = "bold 34px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText("💧 Hydration & Consistency", cardMargin + 48, hydraY + 65);

      ctx.fillStyle = "#38bdf8";
      ctx.font = "bold 52px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(`${(dailyTotals.waterConsumed / 1000).toFixed(1)}L`, cardMargin + 48, hydraY + 145);

      ctx.fillStyle = "#71717a";
      ctx.font = "500 28px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
      ctx.fillText(
        ` / ${(waterTarget / 1000).toFixed(1)}L (${waterPct}%)`,
        cardMargin + 48 + ctx.measureText(`${(dailyTotals.waterConsumed / 1000).toFixed(1)}L`).width + 12,
        hydraY + 145
      );

      // Hydration progress bar
      const wBarX = cardMargin + 48;
      const wBarY = hydraY + 180;
      const wBarW = cardWidth - 96;
      const wBarH = 16;

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(wBarX, wBarY, wBarW, wBarH, 8);
      ctx.fillStyle = "#27272a";
      ctx.fill();

      const wFilled = Math.max(16, Math.min(wBarW, (wBarW * waterPct) / 100));
      const wFillGrad = ctx.createLinearGradient(wBarX, wBarY, wBarX + wFilled, wBarY);
      wFillGrad.addColorStop(0, "#0284c7");
      wFillGrad.addColorStop(1, "#38bdf8");
      ctx.beginPath();
      ctx.roundRect(wBarX, wBarY, wFilled, wBarH, 8);
      ctx.fillStyle = wFillGrad;
      ctx.fill();
      ctx.restore();
    }

    // --- 6. Footer Watermark ---
    const footerY = height - (isStory ? 90 : 45);
    ctx.fillStyle = "#71717a";
    ctx.font = "600 24px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Logged with WeGro · Your Smart Fitness Tracker", width / 2, footerY);
  }, [
    aspectMode,
    dailyTotals,
    userName,
    formattedDate,
    streakDays,
    completedSessions,
    mainWorkoutName,
    totalSetsCount,
    totalVolumeKg,
    caloriePct,
    calorieTarget,
    waterPct,
    waterTarget,
  ]);

  // Re-draw whenever modal opens or aspect ratio changes
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        renderCardToCanvas();
      }, 50);
    }
  }, [isOpen, aspectMode, renderCardToCanvas]);

  if (!isOpen) return null;

  /**
   * Generates a PNG Blob from the Canvas
   */
  const getCanvasBlob = async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png", 0.95);
    });
  };

  /**
   * Native Mobile Share (iOS Safari / Android Chrome share sheet)
   */
  const handleShare = async () => {
    setIsGenerating(true);
    setShareError(null);
    try {
      const blob = await getCanvasBlob();
      if (!blob) throw new Error("Could not generate image blob");

      const fileName = `wegro-recap-${dateStr}.png`;
      const file = new File([blob], fileName, { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `${userName}'s WeGro Recap`,
          text: `Crushed today's workout & nutrition with WeGro! 🔥`,
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } else {
        // Fallback to downloading if Web Share API with files is not supported
        handleDownload();
      }
    } catch (err: any) {
      if (err?.name !== "AbortError") {
        setShareError("Could not launch share sheet. Downloading image instead.");
        handleDownload();
      }
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Direct PNG Download
   */
  const handleDownload = async () => {
    setIsGenerating(true);
    try {
      const blob = await getCanvasBlob();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `wegro-recap-${dateStr}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Ignore
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Copy PNG Image to Clipboard (Desktop)
   */
  const handleCopy = async () => {
    try {
      const blob = await getCanvasBlob();
      if (!blob) return;

      if (navigator.clipboard && (window as any).ClipboardItem) {
        const item = new (window as any).ClipboardItem({ "image/png": blob });
        await navigator.clipboard.write([item]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-lg max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-[#27272a] flex items-center justify-between bg-[#18181b]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center text-white shadow-md shadow-violet-600/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                Share Daily Summary
                <span className="text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded-full border border-violet-500/20 font-mono">
                  HD Card
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400">Instagram Story · WhatsApp · Camera Roll</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Aspect Ratio Switcher */}
        <div className="px-4 py-2 bg-[#121215] border-b border-[#27272a] flex items-center justify-between">
          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
            Format:
          </span>
          <div className="flex items-center gap-1.5 bg-[#18181b] p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={() => setAspectMode("story")}
              className={`py-1 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                aspectMode === "story"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>9:16 Story</span>
            </button>
            <button
              type="button"
              onClick={() => setAspectMode("square")}
              className={`py-1 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                aspectMode === "square"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Square className="w-3.5 h-3.5" />
              <span>1:1 Square</span>
            </button>
          </div>
        </div>

        {/* Card Live Preview Container */}
        <div className="flex-1 overflow-y-auto p-4 flex items-center justify-center bg-[#0d0d10]">
          <div
            className={`relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 bg-[#09090b] transition-all duration-300 ${
              aspectMode === "story" ? "w-[240px] h-[426px]" : "w-[280px] h-[280px]"
            }`}
          >
            {/* Embedded Live Canvas */}
            <canvas ref={canvasRef} className="w-full h-full object-contain block" />
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="p-4 bg-[#18181b] border-t border-[#27272a] space-y-2.5">
          {shareError && (
            <p className="text-[11px] text-amber-400 text-center">{shareError}</p>
          )}

          <div className="grid grid-cols-3 gap-2">
            {/* Primary Share Action */}
            <button
              type="button"
              onClick={handleShare}
              disabled={isGenerating}
              className="col-span-2 py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all disabled:opacity-50"
            >
              {shareSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Shared Successfully!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" />
                  <span>Share (Insta / WhatsApp)</span>
                </>
              )}
            </button>

            {/* Direct Download Button */}
            <button
              type="button"
              onClick={handleDownload}
              disabled={isGenerating}
              className="py-3 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-zinc-700 transition disabled:opacity-50"
              title="Download High-Res PNG"
            >
              <Download className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
            <button
              type="button"
              onClick={handleCopy}
              className="hover:text-violet-300 transition flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copied ? "Copied to clipboard!" : "Copy image to clipboard"}</span>
            </button>
            <span className="font-mono text-zinc-500">1080p Ultra-HD</span>
          </div>
        </div>
      </div>
    </div>
  );
}
