"use client";

import Image from "next/image";
import logo from "../../../public/asset/logo.svg";
import deafIcon from "../../../public/asset/deaficon.png";
import Link from "next/link";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import {
  Accessibility,
  ChevronDown,
  Menu,
  Search,
  UserRound,
  X,
} from "lucide-react";
import { useLocale } from "@/components/locale-provider";
import LocaleToggle from "@/components/locale-toggle";
import SignOutButton from "@/components/auth/sign-out-button";
import {
  balady,
  headerSearch,
  signLanguageSupport,
  siteNavigation,
  type NavigationNode,
} from "@/config/site-navigation";

const desktopQuery = "(min-width: 1025px)";

export default function PortalHeader({
  signedIn = false,
}: {
  signedIn?: boolean;
}) {
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => (locale === "ar" ? ar : en);
  const [mobile, setMobile] = useState(false);
  const [panel, setPanel] = useState<string | null>(null);
  const [hover, setHover] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const header = useRef<HTMLElement>(null);
  const search = useRef<HTMLDialogElement>(null);
  const open = panel ?? hover;

  function close() {
    setPanel(null);
    setHover(null);
    setMobile(false);
  }

  function toggle(id: string) {
    setHover(null);
    setPanel(panel === id ? null : id);
  }

  function resizePage(value: number) {
    setZoom(value);
    document.documentElement.style.zoom = value === 100 ? "" : value + "%";
  }

  const escapeMenu = useEffectEvent((event: KeyboardEvent) => {
    if (event.key !== "Escape" || search.current?.open) return;
    if (open) {
      const id = open === "verify" ? "collapseDigitalStamp" : `site-${open}`;
      header.current
        ?.querySelector<HTMLElement>(`[aria-controls="${id}"]`)
        ?.focus();
      setPanel(null);
      setHover(null);
    } else if (mobile) {
      header.current?.querySelector<HTMLButtonElement>(".site-burger")?.focus();
      close();
    }
  });

  useEffect(() => {
    const media = matchMedia(desktopQuery);
    function outside(event: Event) {
      if (
        event.target instanceof Node &&
        !header.current?.contains(event.target)
      )
        close();
    }
    document.addEventListener("keydown", escapeMenu);
    media.addEventListener("change", close);
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    return () => {
      document.removeEventListener("keydown", escapeMenu);
      media.removeEventListener("change", close);
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
    };
  }, []);

  function menuLink(node: NavigationNode) {
    if ("href" in node)
      return (
        <a key={node.id} href={node.href}>
          {node.label[locale]}
        </a>
      );
    return (
      <section key={node.id}>
        <h3>{node.label[locale]}</h3>
        {node.children.map(menuLink)}
      </section>
    );
  }

  return (
    <header
      className="portal-header site-header"
      ref={header}
      onClick={(event) => {
        if ((event.target as Element).closest("a[href]")) close();
      }}>
      <div className="site-strip">
        <div className="site-notice">
          <span className="font-semibold text-sm">
            {txt(
              "موقع حكومي مسجل لدى هيئة الحكومة الرقمية.",
              "A government website registered with the Digital Government Authority.",
            )}
          </span>
          <a
            href="#collapseDigitalStamp"
            className="site-verify"
            aria-controls="collapseDigitalStamp"
            aria-expanded={open === "verify"}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggle("verify");
            }}>
            {txt("كيف تتحقق", "How to verify")} <ChevronDown size={12} />
          </a>
        </div>
        <div className="site-tools">
          <button
            type="button"
            aria-expanded={open === "access"}
            aria-controls="site-access"
            onClick={() => toggle("access")}>
            <Accessibility size={16} />
            {txt("أدوات سهولة الوصول", "Accessibility Tool")}
          </button>
          <a href={signLanguageSupport}>
            <Image src={deafIcon} width={16} height={16} alt="" />
            {txt("نسخة الصم", "For Deaf")}
          </a>
        </div>
        <div
          className="site-popover"
          id="collapseDigitalStamp"
          hidden={open !== "verify"}>
          <div>
            <Link href="/verify">
              {txt("التحقق من شهادة خاصة", "Verify a private certificate")}
            </Link>
            <a href="https://raqmi.dga.gov.sa/platforms/DigitalStamp/ShowCertificate/316">
              {txt(
                "تسجيل منصة بلدي الحكومية",
                "Official Balady platform registration",
              )}
            </a>
          </div>
        </div>
        <div
          className="site-popover site-access"
          id="site-access"
          hidden={open !== "access"}>
          <div className="site-zoom">
            <button
              disabled={zoom <= 80}
              aria-label={txt("تصغير", "Zoom out")}
              onClick={() => resizePage(zoom - 10)}>
              A−
            </button>
            <output>{zoom}%</output>
            <button
              disabled={zoom >= 150}
              aria-label={txt("تكبير", "Zoom in")}
              onClick={() => resizePage(zoom + 10)}>
              A+
            </button>
            <button onClick={() => resizePage(100)}>
              {txt("إعادة الضبط", "Reset")}
            </button>
          </div>
          <LocaleToggle />
        </div>
      </div>
      <div className="site-row">
        <a className="site-logo" href={balady("/ar")}>
          <Image
            priority
            src={logo}
            width={111}
            height={50}
            alt={txt("خدمات بلدي – الرئيسية", "Balady Services home")}
          />
        </a>
        <button
          className="site-burger"
          aria-controls="site-nav"
          aria-expanded={mobile}
          aria-label={
            mobile
              ? txt("إغلاق القائمة", "Close menu")
              : txt("فتح القائمة", "Open menu")
          }
          onClick={() => {
            close();
            setMobile(!mobile);
          }}>
          {mobile ? <X /> : <Menu />}
        </button>
        <nav
          className="site-nav"
          id="site-nav"
          data-mobile={mobile}
          aria-label={txt("التنقل الرئيسي", "Main navigation")}>
          {siteNavigation.map((node) =>
            "href" in node ? (
              <a className="site-trigger" key={node.id} href={node.href}>
                {node.label[locale]}
              </a>
            ) : (
              <div
                className="site-group"
                key={node.id}
                onPointerEnter={(event) => {
                  if (
                    event.pointerType === "mouse" &&
                    matchMedia(desktopQuery).matches
                  ) {
                    if (panel !== node.id) setPanel(null);
                    setHover(node.id);
                  }
                }}
                onPointerLeave={() => setHover(null)}
                onBlur={(event) => {
                  if (
                    !event.currentTarget.contains(event.relatedTarget) &&
                    open === node.id
                  ) {
                    setPanel(null);
                    setHover(null);
                  }
                }}>
                <button
                  className="site-trigger"
                  aria-expanded={open === node.id}
                  aria-controls={`site-${node.id}`}
                  onClick={() => toggle(node.id)}>
                  {node.label[locale]} <ChevronDown size={15} />
                </button>
                <div
                  className="site-dropdown"
                  id={`site-${node.id}`}
                  hidden={open !== node.id}>
                  {node.children.map(menuLink)}
                </div>
              </div>
            ),
          )}
          <div className="site-actions">
            <button
              aria-haspopup="dialog"
              onClick={() => {
                setPanel(null);
                setHover(null);
                search.current?.showModal();
              }}>
              <Search />
              {txt("بحث", "Search")}
            </button>
            <LocaleToggle className="site-language" onChange={close} />
            {signedIn ? (
              <>
                <Link href="/">
                  <UserRound />
                  {txt("الحساب", "Account")}
                </Link>
                <SignOutButton />
              </>
            ) : (
              <a href={balady("/cstm_sso/verify")}>
                <UserRound />
                {txt("تسجيل الدخول", "Login")}
              </a>
            )}
          </div>
        </nav>
      </div>
      <dialog
        className="site-search"
        ref={search}
        aria-labelledby="site-search-label"
        onClick={(e) => {
          if (e.target === search.current) search.current.close();
        }}>
        <div>
          <button
            className="site-close"
            aria-label={txt("إغلاق", "Close")}
            onClick={() => search.current?.close()}>
            <X />
          </button>
          <form action={headerSearch.href} method="get">
            <label id="site-search-label" htmlFor="site-query">
              {txt("بحث", "Search")}
            </label>
            <div>
              <input
                id="site-query"
                name="search_api_fulltext"
                type="search"
                maxLength={128}
              />
              <button>{txt("بحث", "Search")}</button>
            </div>
          </form>
          <a href={headerSearch.href}>
            {txt("البحث المتقدم", "Advanced search")}
          </a>
          <h3>{txt("اقتراحات شائعة", "Popular suggestions")}</h3>
          {headerSearch.suggestions.map(menuLink)}
        </div>
      </dialog>
    </header>
  );
}
