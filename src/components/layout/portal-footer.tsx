"use client";

import Link from "next/link";
import FooterReferenceLogo from "@/components/branding/footer-reference-logo";
import { useLocale } from "@/components/locale-provider";
import { footerLinkGroups } from "@/config/site-navigation";
import { t } from "@/lib/locale";

export default function PortalFooter() {
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => t(locale, ar, en);
  const links = footerLinkGroups.flatMap((group) => group.links);

  return (
    <footer className="portal-footer">
      <div className="portal-footer-bar">
        <div className="portal-footer-identity">
          <FooterReferenceLogo />
          <span className="portal-footer-identity-copy"><b>{txt("رِفد", "Rifd")}</b><small>{txt("شركة خاصة مستقلة", "Independent private company")}</small></span>
          <span className="portal-footer-reference-note">{txt("مرجع بصري · لا توجد صلة رسمية", "Visual reference · no official affiliation")}</span>
        </div>
        <div className="portal-footer-copyright">
          <span>© {new Date().getFullYear()} Rifd · {txt("جميع الحقوق محفوظة", "All rights reserved")}</span>
          <b>{txt("نظام خاص · ليس مستنداً حكومياً", "Private system · Not a government document")}</b>
        </div>
        <nav className="portal-footer-links" aria-label={txt("روابط التذييل", "Footer links")}>
          {links.map((item) => <Link key={item.id} href={item.href}>{t(locale, item.label.ar, item.label.en)}</Link>)}
        </nav>
      </div>
      <p className="portal-footer-company-note">{txt("بوابة رِفد المستقلة لإدارة الشهادات الصحية الخاصة والتحقق منها. للمساعدة، يرجى التواصل مع مسؤول مساحة العمل.", "Rifd is an independent portal for private health certificates and verification. For support, contact your workspace administrator.")}</p>
    </footer>
  );
}
