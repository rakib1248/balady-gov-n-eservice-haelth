import type { Metadata } from "next";
import { getLocale } from "@/lib/locale-server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "التحقق من الشهادة الصحية" : "Health Certificate Verification",
    robots: { index: false, follow: false, noarchive: true },
  };
}

export default function VerificationLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
