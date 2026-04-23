"use client";

import { useEffect, useState } from "react";

type Props = {
  language?: "en" | "az";
};

export default function ThemeToggle({ language = "en" }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "dark" | "light" | null;
    const initialTheme = savedTheme || "dark";

    setTheme(initialTheme);
    document.documentElement.classList.toggle("dark", initialTheme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    localStorage.setItem("theme", nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  const label =
    theme === "dark"
      ? language === "az"
        ? "İşıqlı rejim"
        : "Light mode"
      : language === "az"
      ? "Qaranlıq rejim"
      : "Dark mode";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="rounded-full border border-zinc-300 bg-white px-5 py-2.5 text-sm font-medium text-zinc-900 shadow-sm transition hover:bg-zinc-100 dark:border-white/10 dark:bg-white/10 dark:text-white dark:hover:bg-white/15"
    >
      {label}
    </button>
  );
}