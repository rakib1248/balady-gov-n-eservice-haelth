import Link from "next/link";
import { FilePlus2, ShieldCheck } from "lucide-react";
import CertificateList from "@/components/certificates/certificate-list";
import { t } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";
import LocaleToggle from "@/components/locale-toggle";
import { getActor } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function CertificatesPage() {
  const locale = await getLocale();
  const actor = await getActor();
  if (!actor) redirect("/login");
  const canEdit = ["OWNER", "ADMIN", "EDITOR"].includes(actor.role);
  const canRevoke = ["OWNER", "ADMIN"].includes(actor.role);
  return <main className="form-page" dir={locale==="ar"?"rtl":"ltr"}><div className="form-top"><Link href="/">← {t(locale,"لوحة التحكم","Dashboard")}</Link><span><ShieldCheck size={15}/> رِفد</span><LocaleToggle/></div><div className="list-heading"><div><h1>{t(locale,"الشهادات الصحية","Health certificates")}</h1><p>{t(locale,"ابحث عن الشهادات وأدر حالتها داخل مساحة شركتك.","Search and manage certificates in your company workspace.")}</p></div>{canEdit&&<Link href="/certificates/new" className="primary-button"><FilePlus2 size={16}/> {t(locale,"إصدار شهادة","Issue certificate")}</Link>}</div><CertificateList locale={locale} canEdit={canEdit} canRevoke={canRevoke}/><footer className="form-disclaimer">{t(locale,"شهادات شركة خاصة — ليست مستندات حكومية.","Private company certificates — not government documents.")}</footer></main>
}
