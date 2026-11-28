import { cookies } from "next/headers";
import type { Locale } from "@/lib/locale";

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get("rifd-locale")?.value === "en" ? "en" : "ar";
}

export async function getPdfLocale(language: string | null): Promise<Locale> {
  return language === "ar" || language === "en" ? language : getLocale();
}
