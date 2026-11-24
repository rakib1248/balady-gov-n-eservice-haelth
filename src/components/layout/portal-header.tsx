"use client";

/* eslint-disable @next/next/no-img-element -- use the supplied remote SVG directly so it can fall back on load failure without a remote image proxy. */

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Menu, Search, ShieldCheck, X } from "lucide-react";
import LocaleToggle from "@/components/locale-toggle";
import SignOutButton from "@/components/auth/sign-out-button";
import { useLocale } from "@/components/locale-provider";
import { headerUtilities, siteNavigation, type NavigationNode } from "@/config/site-navigation";
import { t } from "@/lib/locale";

const headerLogoUrl = "https://balady.gov.sa/themes/custom/balady_new/logo.svg";

export default function PortalHeader({ signedIn = false }: { signedIn?: boolean }) {
  const { locale } = useLocale();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [openNestedId, setOpenNestedId] = useState<string | null>(null);
  const [logoFailed, setLogoFailed] = useState(false);
  const skipFocusOpen = useRef(false);
  const headerRef = useRef<HTMLElement>(null);
  const txt = (ar: string, en: string) => t(locale, ar, en);

  function closeMenus() {
    setMobileOpen(false);
    setOpenMenuId(null);
    setOpenNestedId(null);
  }

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!headerRef.current?.contains(target) || !target.closest(".portal-menu-dropdown")) {
        setOpenMenuId(null);
        setOpenNestedId(null);
      }
      if (!headerRef.current?.contains(target)) setMobileOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      const openTrigger = headerRef.current?.querySelector<HTMLButtonElement>(".portal-menu-trigger[aria-expanded='true']");
      closeMenus();
      if (openTrigger) {
        skipFocusOpen.current = true;
        openTrigger.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function openOnHover(menuId: string) {
    if (window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) {
      setMobileOpen(false);
      setOpenMenuId(menuId);
    }
  }

  function renderSubmenuNode(node: NavigationNode): ReactNode {
    if (!node.children?.length) return <Link className="portal-dropdown-link" key={node.id} href={node.href} onClick={closeMenus}>{t(locale, node.label.ar, node.label.en)}</Link>;
    const isOpen = openNestedId === node.id;
    return <div
      className={`portal-nested-menu${isOpen ? " is-open" : ""}`}
      key={node.id}
      onMouseEnter={() => { if (window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) setOpenNestedId(node.id); }}
      onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) setOpenNestedId(null); }}
      onFocusCapture={(event) => { if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setOpenNestedId(node.id); }}
    >
      <button className="portal-nested-trigger" type="button" aria-expanded={isOpen} aria-controls={`portal-nested-panel-${node.id}`} onClick={() => {
        if (window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) { setOpenNestedId(node.id); return; }
        setOpenNestedId((current) => current === node.id ? null : node.id);
      }}>
        {t(locale, node.label.ar, node.label.en)}<ChevronDown size={13} aria-hidden="true" />
      </button>
      <div id={`portal-nested-panel-${node.id}`} className="portal-nested-panel">
        {node.children.map((child) => renderSubmenuNode(child))}
      </div>
    </div>;
  }

  return (
    <header className="portal-header" ref={headerRef}>
      <div className="portal-header-inner">
        <a className="portal-brand" href="https://balady.gov.sa/ar" target="_blank" rel="noopener noreferrer" onClick={closeMenus} aria-label={txt("فتح موقع بلدي الرسمي في تبويب جديد", "Open the official Balady website in a new tab")}>
          <span className="portal-header-reference-logo" aria-hidden="true">
            {logoFailed ? <ShieldCheck size={29} /> : <img src={headerLogoUrl} alt="" onError={() => setLogoFailed(true)} />}
            <small>{txt("مرجع بصري · لا توجد صلة رسمية", "Visual reference · no affiliation")}</small>
          </span>
        </a>

        <button className="portal-menu-toggle" type="button" aria-label={mobileOpen ? txt("إغلاق القائمة", "Close menu") : txt("فتح القائمة", "Open menu")} aria-expanded={mobileOpen} aria-controls="portal-main-navigation" onClick={() => setMobileOpen((value) => !value)}>
          {mobileOpen ? <X size={21} /> : <Menu size={21} />}
        </button>

        <nav id="portal-main-navigation" className={`portal-nav ${mobileOpen ? "is-open" : ""}`} aria-label={txt("التنقل الرئيسي", "Main navigation")}>
          {siteNavigation.map((item) => <div
            className={`portal-menu-dropdown${item.active ? " is-active" : ""}${openMenuId === item.id ? " is-open" : ""}`}
            key={item.id}
            onMouseEnter={() => openOnHover(item.id)}
            onMouseLeave={(event) => { if (!event.currentTarget.contains(document.activeElement)) setOpenMenuId(null); }}
            onFocusCapture={(event) => {
              if (skipFocusOpen.current) { skipFocusOpen.current = false; return; }
              if (event.target instanceof HTMLElement && event.target.matches(":focus-visible")) setOpenMenuId(item.id);
            }}
          >
            {item.children?.length ? <>
              <button className="portal-menu-trigger" type="button" aria-expanded={openMenuId === item.id} aria-controls={`portal-menu-panel-${item.id}`} onClick={() => {
                if (window.matchMedia("(min-width: 901px) and (hover: hover) and (pointer: fine)").matches) { setOpenMenuId(item.id); return; }
                setOpenMenuId((current) => current === item.id ? null : item.id);
              }}>
                {t(locale, item.label.ar, item.label.en)}<ChevronDown size={14} aria-hidden="true" />
              </button>
              <div id={`portal-menu-panel-${item.id}`} className="portal-dropdown-panel" aria-label={t(locale, item.label.ar, item.label.en)}>
                <div className="portal-dropdown-groups">
                  {item.children.map((group) => {
                    if (group.presentation === "links") return <section className="portal-dropdown-group portal-dropdown-group--links" key={group.id}>
                      <div className="portal-dropdown-group-links">{group.children?.map((child) => renderSubmenuNode(child))}</div>
                    </section>;
                    if (group.presentation === "nested") return <section className="portal-dropdown-group portal-dropdown-group--nested" key={group.id}>
                      {renderSubmenuNode(group)}
                    </section>;
                    const isPlainTitle = group.presentation === "plain" || group.presentation === "group-plain";
                    return <section className={`portal-dropdown-group${group.presentation === "plain" ? " portal-dropdown-group--plain" : ""}`} key={group.id}>
                      <Link className={`portal-dropdown-group-title${isPlainTitle ? " portal-dropdown-group-title--plain" : ""}`} href={group.href} onClick={closeMenus}>{t(locale, group.label.ar, group.label.en)}</Link>
                      <div className="portal-dropdown-group-links">{group.children?.map((child) => renderSubmenuNode(child))}</div>
                    </section>;
                  })}
                </div>
              </div>
            </> : <Link className="portal-menu-trigger" href={item.href} onClick={closeMenus}>{t(locale, item.label.ar, item.label.en)}</Link>}
          </div>)}
          <div className="portal-nav-actions">
            {headerUtilities.map((utility) => <Link className="portal-header-utility" key={utility.id} href={utility.href} onClick={closeMenus}>{utility.id === "search" && <Search size={17} aria-hidden="true" />}{t(locale, utility.label.ar, utility.label.en)}</Link>)}
            <LocaleToggle />
            {signedIn && <><Link className="portal-account" href="/" onClick={closeMenus}>{txt("الحساب", "Account")}</Link><SignOutButton /></>}
          </div>
        </nav>

        <div className="portal-desktop-actions">{headerUtilities.map((utility) => <Link className="portal-header-utility" key={utility.id} href={utility.href} onClick={closeMenus}>{utility.id === "search" && <Search size={17} aria-hidden="true" />}{t(locale, utility.label.ar, utility.label.en)}</Link>)}<LocaleToggle />{signedIn && <><Link className="portal-account" href="/" onClick={closeMenus}>{txt("الحساب", "Account")}</Link><SignOutButton /></>}</div>
      </div>
    </header>
  );
}
