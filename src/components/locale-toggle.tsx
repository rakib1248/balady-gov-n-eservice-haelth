"use client";

import { useLocale } from "@/components/locale-provider";
import { useRouter } from "next/navigation";

export default function LocaleToggle() {
  const { locale: current, setLocale } = useLocale();
  const router = useRouter();
  function toggle() { setLocale(current === "ar" ? "en" : "ar"); router.refresh(); }
  return <button type="button" className="lang-button" onClick={toggle} aria-label={current === "ar" ? "Switch to English" : "التبديل إلى العربية"}>{current === "ar" ? "EN" : "عربي"}</button>;
}
