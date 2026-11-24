export type BilingualLabel = { ar: string; en: string };

export type NavigationPresentation = "group" | "group-plain" | "plain" | "links" | "nested";

export type NavigationNode = {
  id: string;
  label: BilingualLabel;
  href: string;
  presentation?: NavigationPresentation;
  children?: NavigationNode[];
};

export type SiteNavigationItem = NavigationNode & { active?: boolean };

export type FooterLinkGroup = {
  id: string;
  title: BilingualLabel;
  links: Array<{ id: string; label: BilingualLabel; href: "#" }>;
};

const label = (ar: string, en = ar): BilingualLabel => ({ ar, en });
const balady = (path: string) => `https://balady.gov.sa${path}`;
const link = (id: string, text: string, href = "#", en = text): NavigationNode => ({ id, label: label(text, en), href });
const group = (id: string, text: string, href: string, children: NavigationNode[], en = text): NavigationNode => ({ id, label: label(text, en), href, children });
const plain = (id: string, text: string, href = "#", en = text): NavigationNode => ({ ...link(id, text, href, en), presentation: "plain" });
const links = (id: string, children: NavigationNode[]): NavigationNode => ({ id, label: label(""), href: "#", presentation: "links", children });

/** Arabic menu labels and URLs copied from the live official Balady navigation. */
export const siteNavigation: SiteNavigationItem[] = [
  {
    id: "about-balady",
    label: label("عن بلدي", "About Balady"),
    href: "#",
    children: [
      group("about-us", "من نحن", balady("/ar/about-balady/about-us"), [
        link("about-us-page", "من نحن", balady("/ar/about-balady/about-us")),
        link("ministry-structure", "الهيكل التنظيمي", balady("/ar/about-balady/ministry-structure")),
        link("rules", "الأنظمة واللوائح", balady("/ar/about-balady/rules")),
        link("policies-strategies", "السياسات والاستراتيجيات", balady("/ar/about-balady/policy")),
      ], "About us"),
      group("procurement-budget", "المنافسات والمشتريات", balady("/ar/about-balady/policy/%D8%A7%D9%84%D9%85%D9%86%D8%A7%D9%81%D8%B3%D8%A7%D8%AA-%D9%88%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%8A%D8%A7%D8%AA"), [
        link("tenders-procurement", "المنافسات والمشتريات", balady("/ar/about-balady/policy/%D8%A7%D9%84%D9%85%D9%86%D8%A7%D9%81%D8%B3%D8%A7%D8%AA-%D9%88%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%8A%D8%A7%D8%AA")),
        link("budget-statistics", "الميزانية والمصروفات", balady("/ar/about-balady/budget-statistics")),
        link("sustainable-development", "التنمية المستدامة", balady("/ar/about-balady/policy/%D8%A3%D9%87%D8%AF%D8%A7%D9%81-%D8%A7%D9%84%D8%AA%D9%86%D9%85%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D8%AF%D8%A7%D9%85%D8%A9")),
        link("partners", "الشراكات", balady("/ar/about-balady/partners")),
      ], "Procurement and spending"),
      group("e-participation", "المشاركة الإلكترونية", balady("/ar/about-balady/e-participation"), [
        link("e-participation-page", "المشاركة الإلكترونية", balady("/ar/about-balady/e-participation")),
        link("open-data", "البيانات المفتوحة", balady("/ar/about-balady/open-data")),
        link("news", "الأخبار", balady("/ar/about-balady/news")),
        link("events", "الفعاليات", balady("/ar/about-balady/events-list")),
      ], "Electronic participation"),
      group("initiatives", "المبادرات", balady("/ar/about-balady/initiatives"), [
        link("initiatives-page", "المبادرات", balady("/ar/about-balady/initiatives")),
        link("statistics", "البيانات والإحصائيات", balady("/ar/about-balady/e-participation/11180")),
        link("careers", "الوظائف", balady("/ar/about-balady/recruitment")),
        link("help-support", "المساعدة والدعم", balady("/ar/about-balady/help-and-support")),
      ], "Initiatives"),
    ],
  },
  {
    id: "services",
    label: label("الخدمات", "Services"),
    href: "#",
    children: [
      group("requests", "إدارة الطلبات", "https://apps.balady.gov.sa/Eservices/Inquiries/Request", [
        link("manage-requests", "إدارة الطلبات", "https://apps.balady.gov.sa/Eservices/Inquiries/Request"),
        link("manage-licenses", "إدارة الرخص", "https://apps.balady.gov.sa/Eservices/Inquiries/Licenses"),
      ], "Requests"),
      group("commercial-license", "إصدار رخصة تجارية", balady("/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%A9"), [
        link("issue-commercial-license", "إصدار رخصة تجارية", balady("/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%A9")),
        link("renew-commercial-license", "تجديد رخصة نشاط تجاري", balady("/ar/services/%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%A9")),
        link("cancel-commercial-license", "إلغاء رخصة نشاط تجاري", balady("/ar/services/%D8%A5%D9%84%D8%BA%D8%A7%D8%A1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%A9")),
      ], "Issue a commercial license"),
      group("building-license", "إصدار رخصة بناء", balady("/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%A8%D9%86%D8%A7%D8%A1"), [
        link("issue-building-license", "إصدار رخصة بناء", balady("/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%A8%D9%86%D8%A7%D8%A1")),
        link("fence-license", "خدمة إصدار رخصة تسوير أراضي فضاء", balady("/ar/services/%D8%AE%D8%AF%D9%85%D8%A9-%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%B3%D9%88%D9%8A%D8%B1-%D8%A3%D8%B1%D8%A7%D8%B6%D9%8A-%D9%81%D8%B6%D8%A7%D8%A1")),
      ], "Issue a building license"),
      group("health-certificate", "إصدار شهادة صحية", balady("/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B4%D9%87%D8%A7%D8%AF%D8%A9-%D8%B5%D8%AD%D9%8A%D8%A9"), [
        link("issue-health-certificate", "إصدار شهادة صحية", balady("/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B4%D9%87%D8%A7%D8%AF%D8%A9-%D8%B5%D8%AD%D9%8A%D8%A9")),
        link("renew-health-certificate", "تجديد شهادة صحية", balady("/ar/services/%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF-%D8%B4%D9%87%D8%A7%D8%AF%D8%A9-%D8%B5%D8%AD%D9%8A%D8%A9")),
      ], "Issue a health certificate"),
      group("funeral-services", "تسجيل طلب نقل وتجهيز الموتى", balady("/ar/services/%D8%AA%D8%B3%D8%AC%D9%8A%D9%84-%D8%B7%D9%84%D8%A8-%D9%86%D9%82%D9%84-%D9%88%D8%AA%D8%AC%D9%87%D9%8A%D8%B2-%D8%A7%D9%84%D9%85%D9%88%D8%AA%D9%89"), [
        link("deceased-transport", "تسجيل طلب نقل وتجهيز الموتى", balady("/ar/services/%D8%AA%D8%B3%D8%AC%D9%8A%D9%84-%D8%B7%D9%84%D8%A8-%D9%86%D9%82%D9%84-%D9%88%D8%AA%D8%AC%D9%87%D9%8A%D8%B2-%D8%A7%D9%84%D9%85%D9%88%D8%AA%D9%89")),
        link("cemetery-booking", "حجز مقبرة", balady("/ar/services/%D8%AD%D8%AC%D8%B2-%D9%85%D9%82%D8%A8%D8%B1%D8%A9")),
      ], "Funeral services"),
      plain("all-services", "عرض جميع الخدمات", balady("/ar/all-services"), "All services"),
      plain("balady-products", "منتجات بلدي", balady("/ar/all-products"), "Balady products"),
    ],
  },
  {
    id: "inquiries",
    label: label("الاستعلامات", "Inquiries"),
    href: balady("/ar/general-inquiries"),
  },
  {
    id: "help-support",
    label: label("المساعدة والدعم", "Help and support"),
    href: "#",
    children: [
      links("help-links", [
        link("report-corruption", "الإبلاغ عن شبهة فساد", "https://momah.gov.sa/ar/report-corruption"),
        link("contact-us", "اتصل بنا", balady("/ar/help-and-support/contact-us")),
        link("social-media", "وسائل التواصل الإجتماعية", balady("/ar/help-and-support/social-media")),
        link("faq", "الأسئلة الشائعة", balady("/ar/help-and-support/faq-list")),
        link("branch-directory", "دليل فروع الوزارة / الأمانات", balady("/ar/help-and-support/all")),
        link("virtual-municipality", "الأمانة الافتراضية", balady("/ar/services/11719")),
        link("appointment", "حجز موعد", balady("/ar/services/%D8%AD%D8%AC%D8%B2-%D9%85%D9%88%D8%B9%D8%AF-%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A")),
        link("sign-language-support", "الدعم الفني بلغة الإشارة", "https://metaverse.sakani.sa/mv?q=Q4wErTyUiOpAsD7fGhJkLzXcVbNm6T9"),
        link("minister-office", "التواصل مع مكتب معالي الوزير", balady("/ar/services/%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84-%D9%85%D8%B9-%D9%85%D9%83%D8%AA%D8%A8-%D9%85%D8%B9%D8%A7%D9%84%D9%8A-%D8%A7%D9%84%D9%88%D8%B2%D9%8A%D8%B1")),
      ]),
    ],
  },
];

export const headerUtilities: NavigationNode[] = [
  link("search", "بحث"),
  link("settings", "الإعدادات"),
];

export const footerLinkGroups: FooterLinkGroup[] = [
  {
    id: "about",
    title: { ar: "عن الشركة", en: "About the company" },
    links: [
      { id: "about-rifd", label: { ar: "عن رِفد", en: "About Rifd" }, href: "#" },
      { id: "private-system", label: { ar: "نظام خاص مستقل", en: "Independent private system" }, href: "#" },
    ],
  },
  {
    id: "services",
    title: { ar: "الخدمات", en: "Services" },
    links: [
      { id: "certificate-management", label: { ar: "إدارة الشهادات الصحية", en: "Health certificate management" }, href: "#" },
      { id: "verification", label: { ar: "التحقق من الشهادات", en: "Certificate verification" }, href: "#" },
      { id: "issue-certificate", label: { ar: "إصدار شهادة", en: "Issue a certificate" }, href: "#" },
    ],
  },
  {
    id: "information",
    title: { ar: "المعلومات والسياسات", en: "Information and policies" },
    links: [
      { id: "privacy", label: { ar: "سياسة الخصوصية", en: "Privacy policy" }, href: "#" },
      { id: "terms", label: { ar: "الشروط والأحكام", en: "Terms and conditions" }, href: "#" },
    ],
  },
  {
    id: "contact",
    title: { ar: "تواصل معنا", en: "Contact" },
    links: [{ id: "workspace-contact", label: { ar: "مسؤول مساحة العمل", en: "Workspace administrator" }, href: "#" }],
  },
];
