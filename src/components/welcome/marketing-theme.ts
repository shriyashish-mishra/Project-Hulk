import { Inter } from "next/font/google";

/**
 * Shared marketing-page palette — deliberately its own values rather than
 * the shared in-app theme tokens (bg-card/text-primary/etc.), since the
 * marketing pages (welcome, story) use an exact palette distinct from the
 * dashboard's OKLCH-derived one. Centralized here once so both pages stay
 * in sync if it ever moves.
 */
export const COLOR = {
  bg: "#000000",
  card: "#0A0A0A",
  cardElevated: "#111111",
  border: "rgba(255,255,255,0.08)",
  mint: "#37E6B5",
  mintGlow: "rgba(55,230,181,0.18)",
  textPrimary: "#FFFFFF",
  textSecondary: "#A1A1AA",
  textMuted: "#71717A",
} as const;

export const CARD_BASE =
  "rounded-3xl border p-4 transition-all duration-300 hover:shadow-[0_0_24px_rgba(55,230,181,0.08)]";

/** Marketing pages use Inter specifically, distinct from the app's own Poppins (set on <html> in the root layout) — loaded and scoped here rather than globally, so it doesn't affect the rest of the app. */
export const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "900"] });
