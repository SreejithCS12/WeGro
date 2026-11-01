import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCalories(kcal: number): string {
  return Math.round(kcal).toLocaleString();
}

export function formatGrams(g: number): string {
  return Number(g.toFixed(1)).toString();
}

export function formatDateToISO(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function formatDisplayDate(dateString: string): string {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const todayISO = formatDateToISO(today);

  if (dateString === todayISO) {
    return "Today";
  }

  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (dateString === formatDateToISO(yesterday)) {
    return "Yesterday";
  }

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (dateString === formatDateToISO(tomorrow)) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isValidUUID(uuid?: string | null): boolean {
  if (!uuid || typeof uuid !== "string") return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
}

export function calculateActiveStreak(
  datesWithActivity: string[],
  currentDateISO: string = formatDateToISO(new Date())
): number {
  const activeSet = new Set(datesWithActivity);
  let streak = 0;
  const [y, m, d] = currentDateISO.split("-").map(Number);
  const cur = new Date(y, m - 1, d);

  const checkDate = new Date(cur);
  const pad = (n: number) => String(n).padStart(2, "0");
  const toISO = (dt: Date) =>
    `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;

  // If current date has no logs yet, start check from yesterday so morning doesn't reset streak
  if (!activeSet.has(toISO(checkDate))) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  while (activeSet.has(toISO(checkDate))) {
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }

  return streak;
}

export function scrollToTop(smooth: boolean = false): void {
  if (typeof window === "undefined") return;
  try {
    if (smooth) {
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
  } catch {
    window.scrollTo(0, 0);
  }
  if (document.documentElement) document.documentElement.scrollTop = 0;
  if (document.body) document.body.scrollTop = 0;

  const mainEl = document.querySelector("main");
  if (mainEl && mainEl.scrollTop > 0) {
    if (smooth) {
      mainEl.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      mainEl.scrollTop = 0;
    }
  }
}


