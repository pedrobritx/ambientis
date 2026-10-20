"use client";
import { useEffect, useLayoutEffect, useState } from "react";
import { Sun, Moon } from "./icons";

type Appearance = "dawn" | "dusk";
const KEY = "ambientis-appearance";
const valid = (value: string | null): Appearance | null =>
  value === "dawn" || value === "dusk" ? value : null;
function savedAppearance() {
  try {
    return valid(localStorage.getItem(KEY));
  } catch {
    // A blocked preference store must not prevent an in-session change.
    return null;
  }
}
export function AppearanceToggle() {
  const [choice, setChoice] = useState(savedAppearance);
  const [systemDark, setSystemDark] = useState(() =>
    typeof window === "undefined"
      ? false
      : matchMedia("(prefers-color-scheme: dark)").matches,
  );
  const appearance = choice ?? (systemDark ? "dusk" : "dawn");
  useLayoutEffect(() => {
    document.documentElement.dataset.appearance = appearance;
  }, [appearance]);
  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const systemChanged = () => setSystemDark(query.matches);
    const preferenceChanged = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) setChoice(savedAppearance());
    };
    query.addEventListener("change", systemChanged);
    window.addEventListener("storage", preferenceChanged);
    return () => {
      query.removeEventListener("change", systemChanged);
      window.removeEventListener("storage", preferenceChanged);
    };
  }, []);
  const label =
    appearance === "dawn"
      ? "Dawn: ativar modo escuro (Dusk)"
      : "Dusk: ativar modo claro (Dawn)";
  return (
    <button
      type="button"
      className="secondary appearance-toggle"
      aria-label={label}
      title={label}
      onClick={() => {
        const next = appearance === "dawn" ? "dusk" : "dawn";
        setChoice(next);
        try {
          localStorage.setItem(KEY, next);
        } catch {
          // Keep the chosen appearance for this session when persistence is unavailable.
        }
      }}
    >
      {appearance === "dawn" ? <Sun size={19} /> : <Moon size={19} />}
      <span>{appearance === "dawn" ? "Dawn" : "Dusk"}</span>
    </button>
  );
}
