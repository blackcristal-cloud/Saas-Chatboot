import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { translations } from "@/lib/i18n";

const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark");
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "pt");
  const [company, setCompanyState] = useState(() => {
    try {
      const raw = localStorage.getItem("company");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const setCompany = useCallback((c) => {
    setCompanyState(c);
    if (c) localStorage.setItem("company", JSON.stringify(c));
    else localStorage.removeItem("company");
  }, []);

  const toggleTheme = useCallback(() => setTheme((t) => (t === "dark" ? "light" : "dark")), []);
  const toggleLang = useCallback(() => setLang((l) => (l === "pt" ? "en" : "pt")), []);

  const t = useCallback(
    (path) => {
      const parts = path.split(".");
      let node = translations[lang];
      for (const p of parts) {
        if (node == null) return path;
        node = node[p];
      }
      return node ?? path;
    },
    [lang]
  );

  return (
    <AppContext.Provider value={{ theme, toggleTheme, lang, toggleLang, setLang, t, company, setCompany }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};
