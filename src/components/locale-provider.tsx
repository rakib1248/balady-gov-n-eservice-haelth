"use client";

import { createContext, useContext, useState } from "react";
import type { Locale } from "@/lib/locale";

const LocaleContext = createContext<{ locale: Locale; setLocale: (value: Locale) => void } | null>(null);

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: React.ReactNode }) {
  const [locale, updateLocale] = useState<Locale>(initialLocale);
  function setLocale(value: Locale) {
    document.cookie = `rifd-locale=${value}; path=/; max-age=31536000; samesite=lax`;
    document.documentElement.lang = value;
    document.documentElement.dir = value === "ar" ? "rtl" : "ltr";
    updateLocale(value);
  }
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("useLocale must be used within LocaleProvider");
  return value;
}
