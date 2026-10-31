export type AppThemeColor = "purple" | "red" | "orange" | "blue" | "yellow";

export interface ThemeOption {
  id: AppThemeColor;
  name: string;
  badge: string;
  previewHex: string;
  accentHex: string;
  glowColor: string;
  description: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  {
    id: "purple",
    name: "Cosmic Purple",
    badge: "Default",
    previewHex: "#8b5cf6",
    accentHex: "#7c3aed",
    glowColor: "rgba(139, 92, 246, 0.4)",
    description: "Original brand aesthetic with deep cosmic energy",
  },
  {
    id: "red",
    name: "Crimson Blaze",
    badge: "High Energy",
    previewHex: "#ef4444",
    accentHex: "#dc2626",
    glowColor: "rgba(239, 68, 68, 0.4)",
    description: "Bold fiery red for high-intensity motivation",
  },
  {
    id: "orange",
    name: "Sunset Orange",
    badge: "Warmth",
    previewHex: "#f97316",
    accentHex: "#ea580c",
    glowColor: "rgba(249, 115, 22, 0.4)",
    description: "Vibrant and punchy warm orange tones",
  },
  {
    id: "blue",
    name: "Electric Blue",
    badge: "Focus",
    previewHex: "#3b82f6",
    accentHex: "#2563eb",
    glowColor: "rgba(59, 130, 246, 0.4)",
    description: "Sharp and disciplined cool blue tech aesthetic",
  },
  {
    id: "yellow",
    name: "Solar Gold",
    badge: "Radiant",
    previewHex: "#eab308",
    accentHex: "#ca8a04",
    glowColor: "rgba(234, 179, 8, 0.4)",
    description: "Luminous gold yellow with electric vitality",
  },
];

export const THEME_STORAGE_KEY = "wegro_theme";

export function applyTheme(theme: AppThemeColor) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error("Failed to save theme to localStorage:", e);
  }
}

export function getStoredTheme(): AppThemeColor {
  if (typeof window === "undefined") return "purple";
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as AppThemeColor | null;
    if (stored && ["purple", "red", "orange", "blue", "yellow"].includes(stored)) {
      return stored;
    }
  } catch (e) {}
  return "purple";
}
