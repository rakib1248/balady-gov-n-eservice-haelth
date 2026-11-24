export type BilingualLabel = { ar: string; en: string };

export type SiteNavigationItem = {
  id: string;
  label: BilingualLabel;
  href: "#";
  children?: Array<{ id: string; label: BilingualLabel; href: "#" }>;
};

export const siteNavigation: SiteNavigationItem[] = [
  { id: "home", label: { ar: "الرئيسية", en: "Home" }, href: "#" },
  {
    id: "services",
    label: { ar: "الخدمات", en: "Services" },
    href: "#",
    children: [
      { id: "issue-certificate", label: { ar: "إصدار شهادة صحية", en: "Issue a health certificate" }, href: "#" },
      { id: "manage-certificates", label: { ar: "إدارة الشهادات الصحية", en: "Manage health certificates" }, href: "#" },
      { id: "certificate-verification", label: { ar: "التحقق من شهادة", en: "Certificate verification" }, href: "#" },
    ],
  },
  { id: "certificates", label: { ar: "الشهادات الصحية", en: "Health certificates" }, href: "#" },
  { id: "verification", label: { ar: "التحقق من شهادة", en: "Certificate verification" }, href: "#" },
  { id: "contact", label: { ar: "تواصل معنا", en: "Contact us" }, href: "#" },
];

export const footerLinkGroups = [
  {
    id: "about",
    title: { ar: "عن الشركة", en: "About the company" },
    links: [
      { id: "about-rifd", label: { ar: "عن رِفد", en: "About Rifd" }, href: "#" as const },
      { id: "private-system", label: { ar: "نظام خاص مستقل", en: "Independent private system" }, href: "#" as const },
    ],
  },
  {
    id: "services",
    title: { ar: "الخدمات", en: "Services" },
    links: [
      { id: "certificate-management", label: { ar: "إدارة الشهادات الصحية", en: "Health certificate management" }, href: "#" as const },
      { id: "verification", label: { ar: "التحقق من الشهادات", en: "Certificate verification" }, href: "#" as const },
    ],
  },
  {
    id: "information",
    title: { ar: "المعلومات والسياسات", en: "Information and policies" },
    links: [
      { id: "privacy", label: { ar: "سياسة الخصوصية", en: "Privacy policy" }, href: "#" as const },
      { id: "terms", label: { ar: "الشروط والأحكام", en: "Terms and conditions" }, href: "#" as const },
    ],
  },
] as const;
