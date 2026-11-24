import type { Metadata } from "next";
import { getLocale } from "@/lib/locale-server";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "رِفد | إدارة الشهادات الصحية" : "Rifd | Health Certificate Management",
    description: locale === "ar" ? "نظام خاص لإدارة الشهادات الصحية والتحقق منها." : "Private health certificate management and verification.",
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}><body><LocaleProvider initialLocale={locale}>{children}</LocaleProvider></body></html>;
}
