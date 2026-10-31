"use client";

import { cn } from "@/lib/utils";

interface WeGroLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  animated?: boolean;
}

export function WeGroLogo({
  size = "md",
  className,
  animated = true,
}: WeGroLogoProps) {
  const sizeClasses = {
    sm: "w-8 h-8 rounded-xl",
    md: "w-9 h-9 rounded-xl",
    lg: "w-12 h-12 rounded-2xl",
    xl: "w-20 h-20 rounded-3xl",
  };

  const innerRadius = {
    sm: "rounded-[11px]",
    md: "rounded-[11px]",
    lg: "rounded-[14px]",
    xl: "rounded-[22px]",
  };

  const boltSizes = {
    sm: "w-[17px] h-[17px]",
    md: "w-[19px] h-[19px]",
    lg: "w-6 h-6",
    xl: "w-11 h-11",
  };

  const starSizes = {
    sm: "w-2 h-2 top-0.5 right-0.5",
    md: "w-2.5 h-2.5 top-1 right-1",
    lg: "w-3 h-3 top-1.5 right-1.5",
    xl: "w-4 h-4 top-2.5 right-2.5",
  };

  return (
    <div
      className={cn(
        "relative shrink-0 select-none p-[1.5px] transition-all duration-300",
        sizeClasses[size],
        className
      )}
      style={{
        background:
          "linear-gradient(to top right, var(--logo-gradient-from, #6d28d9), var(--logo-gradient-via, #9333ea), var(--logo-gradient-to, #d946ef))",
        boxShadow: "0 10px 15px -3px var(--purple-glow, rgba(139, 92, 246, 0.3))",
      }}
    >
      {/* Inner surface with deep theme gradient */}
      <div
        className={cn(
          "w-full h-full flex items-center justify-center relative overflow-hidden border border-white/10 transition-colors duration-300",
          innerRadius[size]
        )}
        style={{
          background:
            "linear-gradient(to bottom, var(--logo-inner-from, #1c0f33), var(--logo-inner-to, #0c0617))",
        }}
      >
        {/* Specular glass reflection on top */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />

        {/* Vector Lightning Bolt with glowing electric theme gradient */}
        <svg
          className={cn(
            boltSizes[size],
            animated && "animate-wegro-bolt",
            "z-10 transition-transform"
          )}
          viewBox="0 0 24 24"
          fill="none"
        >
          <defs>
            <linearGradient id="wegro-bolt-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--logo-bolt-1, #ffffff)" />
              <stop offset="35%" stopColor="var(--logo-bolt-2, #f3e8ff)" />
              <stop offset="70%" stopColor="var(--logo-bolt-3, #c084fc)" />
              <stop offset="100%" stopColor="var(--logo-bolt-4, #9333ea)" />
            </linearGradient>
          </defs>
          <path
            d="M13 2L3 14H12L11 22L21 10H12L13 2Z"
            fill="url(#wegro-bolt-grad)"
            stroke="#ffffff"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>

        {/* Twinkling Diamond Star Sparkle (Top-Right) */}
        <svg
          className={cn(
            "absolute z-20 text-white",
            starSizes[size],
            animated && "animate-wegro-sparkle-1"
          )}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
        </svg>

        {/* Secondary Sparkle Star (Bottom-Left) for sizes lg and xl */}
        {(size === "lg" || size === "xl") && (
          <svg
            className={cn(
              "absolute bottom-2 left-2 z-20",
              size === "xl" ? "w-2.5 h-2.5" : "w-1.5 h-1.5",
              animated && "animate-wegro-sparkle-2"
            )}
            style={{ color: "var(--logo-sparkle, #c084fc)" }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 0L14.5 9.5L24 12L14.5 14.5L12 24L9.5 14.5L0 12L9.5 9.5L12 0Z" />
          </svg>
        )}
      </div>
    </div>
  );
}
