'use client';

import {useEffect, useState} from "react";

type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "dataforge-theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(current);
  }, []);

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      window.sessionStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {}
  };

  const isLight = theme === "light";

  return (
    <div className="theme-toggle-wrap">
      <button
        type="button"
        role="switch"
        aria-checked={isLight}
        onClick={toggle}
        aria-label={`Switch to ${isLight ? "dark" : "light"} mode`}
        className="theme-switch border-beam relative block h-9 w-[4.5rem] rounded-full transition-colors duration-300"
        data-light={isLight}
      >
        <span
          aria-hidden
          className={`absolute left-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm shadow transition-transform duration-300 ${
            isLight ? "translate-x-9" : "translate-x-0"
          }`}
        >
          {isLight ? "☀️" : "🌙"}
        </span>
      </button>
    </div>
  );
}
