import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import CertificateForm from "@/components/certificates/certificate-form";
import { t } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";
import LocaleToggle from "@/components/locale-toggle";
import { getActor } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function NewCertificatePage() {
  const locale = await getLocale();
  const actor = await getActor();
  if (!actor) redirect("/login");
  if (!["OWNER", "ADMIN", "EDITOR"].includes(actor.role)) redirect("/certificates");
  return <main className="form-page" dir={locale==="ar"?"rtl":"ltr"}><div className="form-top"><Link href="/certificates">← {t(locale,"الشهادات","Certificates")}</Link><span><ShieldCheck size={15}/> رِفد</span><LocaleToggle/></div><div className="form-heading"><Link href="/certificates" className="back-link"><ArrowRight size={16}/> {t(locale,"العودة للشهادات","Back to certificates")}</Link><h1>{t(locale,"إصدار شهادة صحية","Issue health certificate")}</h1><p>{t(locale,"أدخل بيانات المستفيد والمنشأة كما تظهر في المستندات الداعمة.","Enter beneficiary and organization details as shown on supporting documents.")}</p></div><CertificateForm/><footer className="form-disclaimer">{t(locale,"شهادة شركة خاصة — ليست مستنداً حكومياً.","Private company certificate — not a government document.")}</footer></main>
}
