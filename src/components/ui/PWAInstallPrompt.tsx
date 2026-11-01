"use client";

import { useState, useEffect } from "react";
import { Download, X, Share, PlusSquare, Smartphone } from "lucide-react";
import { WeGroLogo } from "./WeGroLogo";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already running as standalone installed PWA
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(isStandaloneMode);

    // If already installed in standalone mode, never show prompt
    if (isStandaloneMode) return;

    // Check if previously dismissed
    const dismissed = localStorage.getItem("wegro_pwa_prompt_dismissed");
    if (!dismissed) {
      setIsDismissed(false);
    }

    // Detect iOS devices
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Listen for Chrome / Android / Edge PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsDismissed(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsDismissed(true);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSInstructions(true);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem("wegro_pwa_prompt_dismissed", "true");
  };

  // Don't render if running in standalone PWA, dismissed, or not eligible
  if (isStandalone || isDismissed) return null;

  return (
    <>
      {/* Floating In-App Install Banner (Bottom-pinned above navigation) */}
      <div className="fixed bottom-20 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-[#141417]/95 backdrop-blur-xl border border-violet-500/40 rounded-2xl p-3.5 shadow-2xl shadow-black/80 flex items-center justify-between gap-3 animate-slide-up">
        <div className="flex items-center gap-3 min-w-0">
          <WeGroLogo size="sm" />
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
              <span>Install WeGro App</span>
              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Free PWA
              </span>
            </h4>
            <p className="text-[11px] text-zinc-400 truncate">
              {isIOS
                ? "Add to Home Screen for full-screen mode"
                : "Install on your device for fast gym logging"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-violet-600/30 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal (When user taps Install on iPhone) */}
      {showIOSInstructions && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-[#141417] border border-[#27272a] rounded-3xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#27272a] pb-3">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-violet-400" />
                <h3 className="text-sm font-bold text-white">Install on iPhone</h3>
              </div>
              <button
                onClick={() => setShowIOSInstructions(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300">
              <div className="flex items-start gap-3 bg-[#18181b] p-3 rounded-2xl border border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                  1
                </div>
                <div>
                  <p className="font-semibold text-white">Tap the Share icon</p>
                  <p className="text-zinc-400 mt-0.5 flex items-center gap-1">
                    At the bottom bar of Safari, tap <Share className="w-3.5 h-3.5 text-sky-400 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#18181b] p-3 rounded-2xl border border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                  2
                </div>
                <div>
                  <p className="font-semibold text-white">Select "Add to Home Screen"</p>
                  <p className="text-zinc-400 mt-0.5 flex items-center gap-1">
                    Scroll down and tap <PlusSquare className="w-3.5 h-3.5 text-emerald-400 inline" />
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-[#18181b] p-3 rounded-2xl border border-zinc-800">
                <div className="w-6 h-6 rounded-lg bg-violet-600/20 text-violet-300 flex items-center justify-center font-bold text-xs shrink-0">
                  3
                </div>
                <div>
                  <p className="font-semibold text-white">Tap "Add" in top-right</p>
                  <p className="text-zinc-400 mt-0.5">
                    WeGro will install with its official icon on your home screen!
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowIOSInstructions(false)}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs transition"
            >
              Got it!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
