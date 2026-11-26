"use client";

import { Languages } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/components/locale-provider";

export default function LocaleToggle({ className = "lang-button", onChange }: {
  className?: string;
  onChange?: () => void;
}) {
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const nextLocale = locale === "ar" ? "en" : "ar";

  function toggle() {
    setLocale(nextLocale);
    onChange?.();
    router.refresh();
  }

  return (
    <button type="button" className={className} lang={nextLocale} onClick={toggle}
      aria-label={nextLocale === "en" ? "Switch to English" : "التبديل إلى العربية"}>
      <Languages size={16} aria-hidden="true" />
      {nextLocale === "en" ? "English" : "العربية"}
    </button>
  );
}
