"use client";

import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

export function FloatingThemeToggle() {
  const { theme, setTheme } = useTheme();

  const buttons = [
    { value: "dark" as const, icon: Moon, label: "Dark mode" },
    { value: "light" as const, icon: Sun, label: "Light mode" },
    { value: "system" as const, icon: Monitor, label: "System theme" },
  ];

  return (
    <div
      className="fixed bottom-5 left-5 z-[200] flex flex-col gap-1.5 rounded-full p-1.5"
      style={{
        backgroundColor: "var(--bg-elevated)",
        border: "1px solid var(--border-default)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      {buttons.map((btn) => (
        <button
          key={btn.value}
          onClick={() => setTheme(btn.value)}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-all duration-200",
            theme === btn.value
              ? "bg-[var(--accent)] text-white"
              : "text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)]"
          )}
          title={btn.label}
          aria-label={btn.label}
        >
          <btn.icon className="h-[15px] w-[15px]" />
        </button>
      ))}
    </div>
  );
}
