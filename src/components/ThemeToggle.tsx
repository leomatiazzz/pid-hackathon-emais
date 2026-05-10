"use client";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function ThemeToggle({ size = "sm" }: { size?: "sm" | "md" }) {
  const { theme, toggle } = useTheme();
  const isLight = theme === "light";
  const px = size === "md" ? "px-3 py-2" : "px-2 py-1.5";
  const iconSize = size === "md" ? 15 : 13;

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 ${px} rounded-lg text-xs font-medium transition-all duration-200`}
      style={{
        background: isLight ? "rgba(3,37,77,0.08)" : "rgba(255,255,255,0.07)",
        border: `1px solid ${isLight ? "rgba(3,37,77,0.18)" : "var(--pid-border)"}`,
        color: isLight ? "#03254D" : "var(--pid-muted)",
      }}
      aria-label={isLight ? "Mudar para modo escuro" : "Mudar para modo claro"}
      title={isLight ? "Modo escuro" : "Modo claro"}
    >
      {isLight ? <Moon size={iconSize} /> : <Sun size={iconSize} />}
    </button>
  );
}
