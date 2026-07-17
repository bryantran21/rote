"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("rote-theme", next ? "dark" : "light");
    } catch {
      /* ignore */
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="grid h-7 w-7 place-items-center rounded-md text-fg-subtle transition-colors hover:bg-bg-elevated hover:text-fg"
    >
      <span className="text-sm" aria-hidden>
        {dark ? "☾" : "☀"}
      </span>
    </button>
  );
}
