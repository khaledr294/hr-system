"use client";

import { useTheme } from "./ThemeProvider";

export default function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, mounted } = useTheme();
  if (!mounted) return null;
  const isPremium = theme === "premium";
  return (
    <button
      type="button"
      onClick={() => setTheme(isPremium ? "sharp" : "premium")}
      className={
        `inline-flex items-center gap-2 px-3 py-1.5 text-sm font-bold rounded-xl ` +
        (isPremium
          ? `glass ring-soft hover-scale text-slate-900 ${className ?? ""}`
          : `border-2 border-slate-900 bg-white hover:bg-slate-200 ${className ?? ""}`)
      }
      aria-label="تبديل المظهر"
      title={isPremium ? "التبديل إلى حاد" : "التبديل إلى بريميوم"}
    >
      <span>{isPremium ? "وضع حاد" : "وضع بريميوم"}</span>
    </button>
  );
}
