"use client";

/* eslint-disable @next/next/no-img-element -- use the supplied remote SVG directly so it can fall back on load failure without adding a remote image proxy. */

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, ShieldCheck, X } from "lucide-react";
import LocaleToggle from "@/components/locale-toggle";
import SignOutButton from "@/components/auth/sign-out-button";
import { useLocale } from "@/components/locale-provider";
import { siteNavigation } from "@/config/site-navigation";
import { t } from "@/lib/locale";

const headerLogoUrl = "https://balady.gov.sa/themes/custom/balady_new/logo.svg";

export default function PortalHeader({ signedIn = false }: { signedIn?: boolean }) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);
  const txt = (ar: string, en: string) => t(locale, ar, en);
  const closeMenu = () => setOpen(false);

  return (
    <header className="portal-header">
      <div className="portal-header-inner">
        <Link className="portal-brand" href="/" onClick={closeMenu} aria-label={txt("رِفد، الصفحة الرئيسية", "Rifd, home page")}>
          <span className="portal-header-reference-logo" aria-hidden="true">
            {logoFailed ? <ShieldCheck size={29} /> : <img src={headerLogoUrl} alt="" onError={() => setLogoFailed(true)} />}
            <small>{txt("مرجع بصري · لا توجد صلة رسمية", "Visual reference · no affiliation")}</small>
          </span>
          <span className="portal-brand-copy"><b>{txt("رِفد", "Rifd")}</b><small>{txt("نظام الشهادات الصحية الخاص", "Private Company Health Certificate System")}</small></span>
        </Link>

        <button className="portal-menu-toggle" type="button" aria-label={open ? txt("إغلاق القائمة", "Close menu") : txt("فتح القائمة", "Open menu")} aria-expanded={open} aria-controls="portal-main-navigation" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav id="portal-main-navigation" className={`portal-nav ${open ? "is-open" : ""}`} aria-label={txt("التنقل الرئيسي", "Main navigation")}>
          {siteNavigation.map((item) => item.children?.length ? (
            <details className="portal-menu-dropdown" key={item.id}>
              <summary>{t(locale, item.label.ar, item.label.en)}<ChevronDown size={14} aria-hidden="true" /></summary>
              <div className="portal-dropdown-panel">
                {item.children.map((child) => <Link key={child.id} href={child.href} onClick={closeMenu}>{t(locale, child.label.ar, child.label.en)}</Link>)}
              </div>
            </details>
          ) : <Link key={item.id} href={item.href} onClick={closeMenu}>{t(locale, item.label.ar, item.label.en)}</Link>)}
          <div className="portal-nav-actions">
            <LocaleToggle />
            {signedIn ? <><Link className="portal-account" href="/" onClick={closeMenu}>{txt("الحساب", "Account")}</Link><SignOutButton /></> : <Link className="portal-account" href="/login" onClick={closeMenu}>{txt("تسجيل الدخول", "Sign in")}</Link>}
          </div>
        </nav>

        <div className="portal-desktop-actions"><LocaleToggle />{signedIn ? <><Link className="portal-account" href="/">{txt("الحساب", "Account")}</Link><SignOutButton /></> : <Link className="portal-account" href="/login">{txt("تسجيل الدخول", "Sign in")}</Link>}</div>
      </div>
    </header>
  );
}
