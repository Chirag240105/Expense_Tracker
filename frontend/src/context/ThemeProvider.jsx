import React, { useContext, useEffect, useMemo, useState } from "react";
import ThemeContext from "./ThemeContext.js";
import { UserContext } from "./UserContext.js";

export default function ThemeProvider({ children }) {
  const { user } = useContext(UserContext);
  const [themePreference, setThemePreference] = useState(
    () => localStorage.getItem("themePreference") || "system"
  );
  const [resolvedTheme, setResolvedTheme] = useState("light");

  useEffect(() => {
    if (user?.preferences?.theme) {
      setThemePreference(user.preferences.theme);
    }
  }, [user?.preferences?.theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const applyTheme = () => {
      const nextTheme = themePreference === "system"
        ? media.matches ? "dark" : "light"
        : themePreference;
      document.documentElement.dataset.theme = nextTheme;
      setResolvedTheme(nextTheme);
      localStorage.setItem("themePreference", themePreference);
    };

    applyTheme();
    media.addEventListener("change", applyTheme);
    return () => media.removeEventListener("change", applyTheme);
  }, [themePreference]);

  const value = useMemo(
    () => ({ themePreference, setThemePreference, resolvedTheme }),
    [themePreference, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
