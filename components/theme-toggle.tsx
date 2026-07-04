"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const shouldUseDark = saved === "dark";
    setDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className="focus-ring inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ash bg-paper hover:border-marigold"
      aria-label={dark ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren"}
      title={dark ? "Hellen Modus aktivieren" : "Dunklen Modus aktivieren"}
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
