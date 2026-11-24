import Link from "next/link";
import { ArrowUpRight, BadgeCheck, QrCode, ShieldCheck } from "lucide-react";
import PortalFrame from "@/components/layout/portal-frame";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/locale";

export default async function VerificationGuidePage() {
  const locale = await getLocale();
  const txt = (ar: string, en: string) => t(locale, ar, en);
  return <PortalFrame><main className="verification-guide" dir={locale === "ar" ? "rtl" : "ltr"}>
    <section className="guide-hero"><span className="guide-eyebrow"><ShieldCheck size={15} />{txt("خدمة التحقق", "Verification service")}</span><h1>{txt("تحقق من شهادة صحية خاصة", "Verify a private health certificate")}</h1><p>{txt("امسح رمز QR المطبوع على الشهادة لفتح صفحة تحقق آمنة تعرض حالتها والتفاصيل المعتمدة.", "Scan the QR code printed on a certificate to open a secure page with its status and approved details.")}</p><div className="guide-private-label">{txt("نظام الشهادات الصحية الخاص · ليس مستنداً حكومياً", "Private Company Health Certificate System · Not a Government Document")}</div></section>
    <section className="guide-steps"><article><span><QrCode size={21} /></span><h2>{txt("١. امسح الرمز", "1. Scan the code")}</h2><p>{txt("استخدم كاميرا هاتفك لمسح رمز QR الموجود على نسخة الشهادة.", "Use your phone camera to scan the QR code on the certificate.")}</p></article><article><span><BadgeCheck size={21} /></span><h2>{txt("٢. راجع الحالة", "2. Review the status")}</h2><p>{txt("ستعرض الصفحة ما إذا كانت الشهادة سارية أو منتهية أو ملغاة.", "The page will show whether the certificate is valid, expired, or revoked.")}</p></article><article><span><ShieldCheck size={21} /></span><h2>{txt("٣. تحقق بأمان", "3. Verify securely")}</h2><p>{txt("لا تحتاج إلى تسجيل الدخول. لا تُعرض أرقام الهوية أو بيانات الدخول.", "No login is required. Identity numbers and login details are not displayed.")}</p></article></section>
    <div className="guide-cta"><span>{txt("لإدارة الشهادات؟", "Need to manage certificates?")}</span><Link href="/login">{txt("تسجيل الدخول", "Sign in")} <ArrowUpRight size={15} /></Link></div>
  </main></PortalFrame>;
}
