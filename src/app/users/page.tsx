import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { getActor } from "@/lib/authorization";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/locale";
import PortalFrame from "@/components/layout/portal-frame";
import UserManagement from "@/components/users/user-management";

export default async function UsersPage() {
  const [actor, locale] = await Promise.all([getActor(), getLocale()]);
  if (!actor) redirect("/login");
  if (actor.role !== "OWNER") redirect("/");
  return <PortalFrame signedIn><main className="form-page user-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="form-top"><Link href="/">← {t(locale, "لوحة التحكم", "Dashboard")}</Link><span>{t(locale, "إدارة مساحة العمل", "Workspace administration")}</span></div>
    <div className="list-heading"><div><h1>{t(locale, "إدارة المستخدمين", "User management")}</h1><p>{t(locale, "أدر حسابات المستخدمين وصلاحياتهم في مساحة شركتك.", "Manage user accounts and access in your company workspace.")}</p></div><Link href="/" className="back-link"><ArrowRight size={15} /> {t(locale, "لوحة التحكم", "Dashboard")}</Link></div>
    <UserManagement locale={locale} actorId={actor.id} />
    <footer className="form-disclaimer">{t(locale, "إدارة المستخدمين متاحة لمالك مساحة العمل فقط.", "User management is available to workspace owners only.")}</footer>
  </main></PortalFrame>;
}
