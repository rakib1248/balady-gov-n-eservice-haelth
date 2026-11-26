"use client";

import Image from "next/image";
import { useState } from "react";
import { ArrowUp, ExternalLink, MessagesSquare } from "lucide-react";
import FooterReferenceLogo from "@/components/branding/footer-reference-logo";
import { useLocale } from "@/components/locale-provider";
import { balady, footerLinkGroups, footerPolicies, signLanguageSupport } from "@/config/site-navigation";
import playStore from "../../../public/asset/Playstore.svg";
import appStore from "../../../public/asset/Appstore.svg";
import icons from "../../../public/asset/footer-icons.svg";
import FooterAccessibility from "./footer-accessibility";
import "./portal-footer.css";

const socialLinks = [
  { icon: "x", name: "X", href: "https://twitter.com/balady_gov" },
  { icon: "youtube", name: "YouTube", href: "https://www.youtube.com/channel/UCTZbeEfXcGk7GgvM9HLEVTQ/featured" },
  { icon: "instagram", name: "Instagram", href: "https://www.instagram.com/balady_gov/" },
] as const;

function Icon({ name }: { name: string }) {
  return <svg width="18" height="18" aria-hidden="true"><use href={icons.src + "#" + name} width="100%" height="100%" /></svg>;
}

export default function PortalFooter() {
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => locale === "ar" ? ar : en;
  const [dark, setDark] = useState(false);
  const [contrast, setContrast] = useState(false);

  return (
    <footer className="balady-footer" data-dark={dark} data-contrast={contrast}>
      <div className="balady-footer-container">
        <div className="balady-footer-columns">
          {footerLinkGroups.map((group) => (
            <nav key={group.title.en} aria-label={group.title[locale]}>
              <h2>{group.title[locale]}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link.label.en}>
                    <a href={link.href}>
                      {link.label[locale]}
                      {link.external && (
                        <ExternalLink
                          size={13}
                          className="balady-footer-external"
                          aria-hidden="true"
                        />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="balady-footer-resources">
            <section>
              <h2>{txt("تواصل معنا", "Connect Us")}</h2>
              <div className="balady-footer-buttons">
                <a href="tel:199040">
                  <Icon name="phone" />
                  <bdi>199040</bdi>
                </a>
                <a
                  href="https://x.com/balady_cs?s=11&t=rVJQhD_qQky7a3MNCfOJtA"
                  target="_blank"
                  rel="noreferrer">
                  <Icon name="x" />
                  {txt("العناية بعملاء بلدي", "Balady Customer Care")}
                </a>
              </div>
            </section>
            <section>
              <h2>{txt("تابعنا على", "Follow us on")}</h2>
              <div className="balady-footer-buttons">
                {socialLinks.map((link) => (
                  <a
                    key={link.icon}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={link.name}>
                    <Icon name={link.icon} />
                  </a>
                ))}
              </div>
            </section>
            <section>
              <h2>
                {txt("أدوات الوصول والإتاحة", "Accessibility and access tools")}
              </h2>
              <FooterAccessibility
                dark={dark}
                contrast={contrast}
                onDark={() => setDark(!dark)}
                onContrast={() => setContrast(!contrast)}
              />
              <div className="balady-footer-buttons">
                <a href={signLanguageSupport} target="_blank" rel="noreferrer">
                  <Icon name="sign" />
                  {txt(
                    "الدعم الفني بلغة الإشارة",
                    "Technical support in sign language",
                  )}
                </a>
              </div>
            </section>
            <section>
              <h2>{txt("حمّل تطبيق بلدي", "Download the Balady app")}</h2>
              <div className="balady-footer-stores">
                <a
                  href="https://play.google.com/store/apps/details?id=momra.balady.android&hl=ar&gl=US"
                  target="_blank"
                  rel="noreferrer">
                  <Image
                    src={playStore}
                    width={120}
                    height={36}
                    alt={txt(
                      "تطبيق بلدي على Google Play",
                      "Balady app on Google Play",
                    )}
                  />
                </a>
                <a
                  href="https://apps.apple.com/us/app/%D8%A8%D9%84%D8%AF%D9%8A/id1522185123"
                  target="_blank"
                  rel="noreferrer">
                  <Image
                    src={appStore}
                    width={120}
                    height={36}
                    alt={txt(
                      "تطبيق بلدي على App Store",
                      "Balady app on the App Store",
                    )}
                  />
                </a>
              </div>
            </section>
          </div>
        </div>
        <div className="balady-footer-bottom">
          <div>
            <nav
              className="balady-footer-policies"
              aria-label={txt("سياسات الموقع", "Site policies")}>
              {footerPolicies.map((link) => (
                <a key={link.href} href={link.href}>
                  {link.label[locale]}
                </a>
              ))}
            </nav>
            <p className="balady-footer-copyright">
              © {new Date().getFullYear()}{" "}
              {txt(
                "رِفد · جميع الحقوق محفوظة لوزارة الشؤون البلدية والإسكان © 2026",
                "All rights reserved to the Ministry of Municipalities and Housing © 2026",
              )}
            </p>
            <p>
              {txt(
                "هذا الموقع ليس موقعًا حكوميًا رسميًا، بل هو موقع تم تطويره وصيانته من قبل وزارة الشؤون البلدية والإسكان.",
                "Developed and maintained by the Ministry of Municipalities and Housing",
              )}
            </p>
          </div>
          <div className="balady-footer-logos">
            <FooterReferenceLogo arabic={locale === "ar"} />
          </div>
        </div>
        <div className="balady-footer-shortcuts">
          <a href="#top">
            {txt("العودة إلى الأعلى", "Back to top")} <ArrowUp size={16} />
          </a>
          <a
            className="balady-footer-support"
            href={balady("/en/help-and-support/contact-us")}
            aria-label={txt("تواصل مع دعم بلدي", "Contact Balady support")}>
            <MessagesSquare size={24} />
          </a>
        </div>
      </div>
    </footer>
  );
}
