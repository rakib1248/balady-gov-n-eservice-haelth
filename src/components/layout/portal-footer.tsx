"use client";

import Link from "next/link";
import { ArrowUpLeft, ShieldCheck } from "lucide-react";
import FooterReferenceLogo from "@/components/branding/footer-reference-logo";
import { useLocale } from "@/components/locale-provider";
import { footerLinkGroups } from "@/config/site-navigation";
import { t } from "@/lib/locale";

export default function PortalFooter() {
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => t(locale, ar, en);

  return (
    <footer className="portal-footer">
      <div className="portal-footer-grid">
        <section className="portal-footer-about">
          <h2>{txt("عن الشركة", "About the company")}</h2>
          <Link className="portal-footer-brand" href="#">
            <span className="portal-brand-mark"><ShieldCheck size={20} /></span>
            <span><b>{txt("رِفد", "Rifd")}</b><small>{txt("نظام الشهادات الصحية الخاص", "Private Company Health Certificate System")}</small></span>
          </Link>
          <p>{txt("بوابة مستقلة لإدارة الشهادات الصحية الخاصة ومراجعتها والتحقق منها.", "An independent portal for managing, reviewing, and verifying private health certificates.")}</p>
          <div className="portal-footer-reference">
            <FooterReferenceLogo />
            <small>{txt("عمل فني مرجعي مقدم · لا توجد صلة رسمية", "Supplied visual reference · no official affiliation")}</small>
          </div>
        </section>

        {footerLinkGroups.map((group) => <section key={group.id}>
          <h2>{t(locale, group.title.ar, group.title.en)}</h2>
          {group.links.map((item) => <Link key={item.id} href={item.href}>{t(locale, item.label.ar, item.label.en)}</Link>)}
          {group.id === "information" && <p>{txt("تُعرض معلومات الشهادة اللازمة للتحقق فقط. بيانات التواصل والسياسات التفصيلية يحددها مالك مساحة العمل.", "Only information needed to verify a certificate is shown. The workspace owner maintains contact and detailed policy information.")}</p>}
        </section>)}

        <section className="portal-footer-contact">
          <h2>{txt("تواصل معنا", "Contact")}</h2>
          <p>{txt("للمساعدة وبيانات التواصل، يرجى الرجوع إلى مسؤول مساحة العمل.", "For support and contact details, please reach out to your workspace administrator.")}</p>
          <p>{txt("هذا نظام خاص. الحسابات متاحة للمستخدمين المخولين من مالك مساحة العمل.", "This is a private system. Accounts are available to users authorized by the workspace owner.")}</p>
        </section>
      </div>
      <div className="portal-footer-bottom">
        <span>© {new Date().getFullYear()} Rifd · {txt("نظام خاص، ليس مستنداً حكومياً", "Private company system, not a government document")}</span>
        <span className="portal-footer-disclaimer"><ShieldCheck size={14} />{txt("شركة خاصة مستقلة · لا تمثل أي جهة حكومية", "Independent private company · not affiliated with any government authority")}</span>
        <a href="#" onClick={(event) => { event.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{txt("العودة للأعلى", "Back to top")} <ArrowUpLeft size={14} /></a>
      </div>
    </footer>
  );
}
