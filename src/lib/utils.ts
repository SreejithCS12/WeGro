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

