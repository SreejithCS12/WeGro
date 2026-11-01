"use client";

import { useState, useEffect } from "react";
import {
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Eye,
  EyeOff,
  Flame,
  ShieldCheck,
  Dumbbell,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Check,
} from "lucide-react";
import { WeGroLogo } from "@/components/ui/WeGroLogo";
import {
  signInWithEmail,
  signUpWithEmail,
  sendPasswordResetEmail,
  updateUserPassword,
} from "@/lib/services/supabase-service";
import { createClient } from "@/lib/supabase/client";

interface AuthViewProps {
  onSuccess?: () => void;
  defaultTab?: "signin" | "signup" | "forgot" | "reset";
  onBackToLanding?: () => void;
}

type AuthTab = "signin" | "signup" | "forgot" | "reset";

export function AuthView({
  onSuccess,
  defaultTab = "signup",
  onBackToLanding,
}: AuthViewProps) {
  const [tab, setTab] = useState<AuthTab>(defaultTab);

  useEffect(() => {
    setTab(defaultTab);
  }, [defaultTab]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetCooldown, setResetCooldown] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Cooldown countdown timer for password reset attempts
  useEffect(() => {
    if (resetCooldown > 0) {
      const timer = setTimeout(() => setResetCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resetCooldown]);

  // Check if user reached here via a password reset email link
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (window.location.hash.includes("type=recovery")) {
        setTab("reset");
      }
    }

    const supabase = createClient();
    if (!supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: any) => {
      if (event === "PASSWORD_RECOVERY") {
        setTab("reset");
        setErrorMessage(null);
        setSuccessMessage("Identity verified. Please choose a new password.");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    // 1. FORGOT PASSWORD FLOW
    if (tab === "forgot") {
      if (!cleanEmail || !cleanEmail.includes("@")) {
        setErrorMessage("Please enter a valid email address.");
        return;
      }

      setIsLoading(true);
      try {
        await sendPasswordResetEmail(cleanEmail);
        setResetCooldown(60);
        setSuccessMessage(
          `We've sent a password reset link to ${cleanEmail}. Please check your inbox and spam folder.`
        );
      } catch (err: any) {
        console.warn("Password reset error:", err?.message || err);
        const msg = err?.message || "";
        if (msg.toLowerCase().includes("rate limit")) {
          setResetCooldown(60);
          setErrorMessage(
            "Email rate limit reached. Supabase limits email frequency to prevent spam — please wait 60 seconds before trying again."
          );
        } else {
          setErrorMessage(msg || "Failed to send reset email. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 2. SET NEW PASSWORD FLOW (Returning from recovery link)
    if (tab === "reset") {
      if (password.length < 6) {
        setErrorMessage("New password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match.");
        return;
      }

      setIsLoading(true);
      try {
        await updateUserPassword(password);
        setSuccessMessage("Password updated successfully! Entering WeGro...");
        setTimeout(() => {
          if (typeof window !== "undefined") {
            window.location.hash = "";
          }
          onSuccess?.();
        }, 1000);
      } catch (err: any) {
        console.warn("Update password error:", err?.message || err);
        const msg = err?.message || "Failed to update password. Please request a new link.";
        setErrorMessage(msg);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 3. SIGN IN & SIGN UP FLOW
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters.");
      return;
    }

    if (tab === "signup" && !displayName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setIsLoading(true);

    try {
      if (tab === "signin") {
        await signInWithEmail(cleanEmail, password);
        setSuccessMessage("Welcome back! Loading your profile...");
        setTimeout(() => {
          onSuccess?.();
        }, 500);
      } else {
        const result = await signUpWithEmail(cleanEmail, password, displayName.trim());
        if (result.session) {
          setSuccessMessage("Account created successfully! Preparing your setup...");
          setTimeout(() => {
            onSuccess?.();
          }, 500);
        } else {
          setSuccessMessage("Account created! Please check your email inbox to confirm your account, then sign in.");
          setTab("signin");
        }
      }
    } catch (err: any) {
      console.warn("Auth request failed:", err?.message || err);
      const msg = err?.message || "Authentication failed. Please check your credentials.";
      if (msg.toLowerCase().includes("invalid login credentials")) {
        setErrorMessage("Invalid email or password. Please try again.");
      } else if (msg.toLowerCase().includes("user already registered")) {
        setErrorMessage("An account with this email already exists. Try signing in.");
      } else if (msg.toLowerCase().includes("is invalid")) {
        setErrorMessage("Supabase security rejects reserved/dummy emails (like test@gmail.com). Please use a valid personal or work email.");
      } else if (msg.toLowerCase().includes("password")) {
        setErrorMessage("Password must be at least 6 characters.");
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#09090b] text-[#f4f4f5] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {onBackToLanding && (
          <div className="flex justify-start">
            <button
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/80 border border-zinc-800 text-xs font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all cursor-pointer backdrop-blur-sm shadow-md"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          </div>
        )}

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="relative group cursor-default">
            <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition duration-500" />
            <WeGroLogo size="lg" />
          </div>

          <div className="space-y-1.5">
            <h1 className="text-3xl font-black tracking-tight text-white">
              WeGro
            </h1>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
              Precision calorie & macro tracking, hypertrophy training logs, and cloud sync.
            </p>
          </div>
        </div>

        {/* Auth Card */}
        <div
          className="bg-[#141417] border border-[#27272a] rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden backdrop-blur-xl"
          style={{
            boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.7), 0 0 40px -10px var(--theme-glow, rgba(139, 92, 246, 0.15))",
          }}
        >
          {/* Subtle top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />

          {/* Standard Tab Switcher for Sign In / Sign Up */}
          {(tab === "signin" || tab === "signup") && (
            <div className="flex p-1 bg-zinc-900/90 border border-zinc-800 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab("signin");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tab === "signin"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab("signup");
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  tab === "signup"
                    ? "bg-violet-600 text-white shadow-md shadow-violet-600/40"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* Forgot Password Sub-Header */}
          {tab === "forgot" && (
            <div className="mb-5 space-y-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Back to Sign In"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 text-white font-bold text-sm">
                  <KeyRound className="w-4 h-4 text-violet-400" />
                  <span>Reset Password</span>
                </div>
              </div>
              <p className="text-xs text-zinc-400 pl-6 leading-relaxed">
                Enter your email address and we'll send you a link to reset your account password.
              </p>
            </div>
          )}

          {/* Set New Password Header */}
          {tab === "reset" && (
            <div className="mb-5 space-y-1">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-violet-400" />
                <span className="text-white font-bold text-sm">Create New Password</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Choose a strong new password for your WeGro account.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-200 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="flex-1">{successMessage}</div>
            </div>
          )}

          {/* Forms */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Sign Up: Name Field */}
            {tab === "signup" && (
              <div className="animate-fade-in">
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Your Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sreejith"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field (for signin, signup, forgot) */}
            {tab !== "reset" && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Password Field (for signin and signup) */}
            {(tab === "signin" || tab === "signup") && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                    Password
                  </label>
                  {tab === "signin" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setTab("forgot");
                        setErrorMessage(null);
                        setSuccessMessage(null);
                      }}
                      className="text-[11px] font-medium text-violet-400 hover:text-violet-300 transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  ) : (
                    <span className="text-[10px] text-zinc-500">Min 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-10 pr-10 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all ${
                      showPassword ? "" : "font-mono"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {/* Set New Password Fields (when tab === "reset") */}
            {tab === "reset" && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors rounded-lg cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-900/80 border border-zinc-800 rounded-xl text-sm text-white placeholder-zinc-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading || (tab === "forgot" && resetCooldown > 0)}
              className="w-full py-3 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/50 disabled:cursor-not-allowed text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-violet-600/30 transition-all active:scale-[0.98] cursor-pointer mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : tab === "signin" ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : tab === "signup" ? (
                <>
                  <span>Create Account & Setup</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : tab === "forgot" ? (
                <>
                  <span>
                    {resetCooldown > 0 ? `Resend Link in ${resetCooldown}s` : "Send Reset Link"}
                  </span>
                  <Mail className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Update Password</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Back to sign in shortcut when in forgot mode */}
            {tab === "forgot" && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setTab("signin");
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Sign In</span>
                </button>
              </div>
            )}
          </form>

          {/* Features Highlights */}
          <div className="mt-6 pt-5 border-t border-zinc-800/80 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Flame className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Smart Macros</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <Dumbbell className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Gym Routines</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-lg bg-violet-500/10 text-violet-400 flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Cloud Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
