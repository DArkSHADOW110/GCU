"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function LoginThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-3 rounded-xl glass-card">
        <div className="h-5 w-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-3 rounded-xl glass-card hover:border-[var(--border-hover)] transition-all group"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-text-secondary group-hover:text-primary transition-colors" />
      )}
    </button>
  );
}
