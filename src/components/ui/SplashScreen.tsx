"use client";

import { useEffect, useState, useMemo } from "react";

const MOTIVATIONAL_QUOTES = [
  "Consistency is your superpower.",
  "Another day to get 1% better.",
  "Discipline over motivation.",
  "Small daily wins build massive strength.",
  "Fuel the machine. Lift heavy.",
  "Track today. Grow tomorrow.",
];

interface SplashScreenProps {
  isFadingOut: boolean;
}

export function SplashScreen({ isFadingOut }: SplashScreenProps) {
  const [mounted, setMounted] = useState(false);

  // Pick a consistent random quote per session
  const quote = useMemo(() => {
    const idx = Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length);
    return MOTIVATIONAL_QUOTES[idx];
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] bg-[#09090b] flex flex-col items-center justify-between p-8 select-none transition-all duration-500 ease-out ${
        isFadingOut
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
    >
      {/* Top spacing */}
      <div className="h-10" />

      {/* Central Floating Minimalist Badge */}
      <div className="flex flex-col items-center justify-center space-y-7 relative my-auto">
        {/* Soft Radial Ambient Glow */}
        <div className="absolute w-72 h-72 rounded-full bg-violet-600/10 blur-3xl pointer-events-none -z-10" />

        {/* Central Logo Squircle with Breathing Animation */}
        <div
          className={`relative w-28 h-28 rounded-[28px] bg-gradient-to-tr from-purple-900/40 via-violet-600/30 to-fuchsia-500/30 border border-white/15 shadow-[0_10px_35px_rgba(139,92,246,0.25)] flex items-center justify-center overflow-hidden transition-all duration-700 ${
            mounted ? "scale-100 opacity-100" : "scale-90 opacity-0"
          }`}
          style={{
            animation: "whoop-float 3s ease-in-out infinite",
          }}
        >
          {/* Subtle Glass Shimmer Accent */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />

          {/* Electric Neon Lightning Bolt */}
          <svg
            className="w-14 h-14 relative z-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            style={{
              filter: "drop-shadow(0 0 12px rgba(255, 255, 255, 0.7)) drop-shadow(0 0 24px rgba(217, 70, 239, 0.5))",
            }}
          >
            <path
              d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
              fill="url(#splash-bolt-grad)"
              stroke="#ffffff"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <defs>
              <linearGradient id="splash-bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#fdf4ff" />
              </linearGradient>
            </defs>
          </svg>

          {/* Star Accent */}
          <div className="absolute top-2.5 right-2.5 text-fuchsia-200 text-xs font-mono">✦</div>
        </div>

        {/* Brand Typography with Letter-Spacing Expansion */}
        <div className="text-center space-y-2">
          <h1
            className={`text-3xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-100 to-zinc-300 transition-all duration-700 delay-100 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            WeGro
          </h1>
          <p
            className={`text-xs font-medium text-zinc-400 tracking-wide transition-all duration-700 delay-200 ${
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
            }`}
          >
            Track today. Grow tomorrow.
          </p>
        </div>

        {/* Minimal Subtle Loading Indicator */}
        <div className="w-24 h-0.5 bg-zinc-800 rounded-full overflow-hidden relative mt-2">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full w-full"
            style={{
              animation: "whoop-bar 1.5s ease-in-out infinite",
              backgroundSize: "200% 100%",
            }}
          />
        </div>
      </div>

      {/* Motivational Quote at Bottom */}
      <div
        className={`text-center transition-all duration-700 delay-300 pb-4 ${
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <p className="text-xs font-mono text-zinc-500 italic">
          "{quote}"
        </p>
      </div>

      <style jsx>{`
        @keyframes whoop-float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-3px) scale(1.02);
          }
        }
        @keyframes whoop-bar {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
}
