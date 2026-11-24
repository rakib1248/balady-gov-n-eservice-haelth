import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import CertificateList from "@/components/certificates/certificate-list";
import { t } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";
import PortalFrame from "@/components/layout/portal-frame";
import { getActor } from "@/lib/authorization";
import { redirect } from "next/navigation";

export default async function CertificatesPage() {
  const locale = await getLocale();
  const actor = await getActor();
  if (!actor) redirect("/login");
  const canEdit = ["OWNER", "ADMIN", "STAFF", "EDITOR"].includes(actor.role);
  const canRevoke = ["OWNER", "ADMIN"].includes(actor.role);
  return <PortalFrame signedIn><main className="form-page" dir={locale==="ar"?"rtl":"ltr"}><div className="form-top"><Link href="/">← {t(locale,"لوحة التحكم","Dashboard")}</Link><span>{t(locale,"مساحة الشهادات","Certificate workspace")}</span></div><div className="list-heading"><div><h1>{t(locale,"الشهادات الصحية","Health certificates")}</h1><p>{t(locale,"ابحث عن الشهادات وأدر حالتها داخل مساحة شركتك.","Search and manage certificates in your company workspace.")}</p></div>{canEdit&&<Link href="/certificates/new" className="primary-button"><FilePlus2 size={16}/> {t(locale,"إصدار شهادة","Issue certificate")}</Link>}</div><CertificateList locale={locale} canEdit={canEdit} canRevoke={canRevoke}/><footer className="form-disclaimer">{t(locale,"شهادات شركة خاصة — ليست مستندات حكومية.","Private company certificates — not government documents.")}</footer></main></PortalFrame>
}
