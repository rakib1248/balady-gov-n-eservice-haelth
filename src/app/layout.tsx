import type { Metadata } from "next";
import { getLocale } from "@/lib/locale-server";
import { LocaleProvider } from "@/components/locale-provider";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: "Issue Health Certificate",
    description: locale === "ar"
      ? "نظام خاص لإدارة وإصدار الشهادات الصحية والتحقق منها."
      : "Manage, issue, and verify health certificates with the Health Certificate Management System.",
    icons: {
      icon: [{ url: "/favIcon.png", type: "image/png", sizes: "867x871" }],
      shortcut: "/favIcon.png",
      apple: "/favIcon.png",
    },
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}><body><LocaleProvider initialLocale={locale}>{children}</LocaleProvider></body></html>;
}
