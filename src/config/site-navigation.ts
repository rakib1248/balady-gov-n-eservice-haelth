export type BilingualLabel = { ar: string; en: string };

export type NavigationPresentation = "group" | "group-plain" | "plain" | "links" | "nested";

export type NavigationNode = {
  id: string;
  label: BilingualLabel;
  href: "#";
  presentation?: NavigationPresentation;
  children?: NavigationNode[];
};

export type SiteNavigationItem = NavigationNode & { active?: boolean };

export type FooterLinkGroup = {
  id: string;
  title: BilingualLabel;
  links: Array<{ id: string; label: BilingualLabel; href: "#" }>;
};

const label = (text: string): BilingualLabel => ({ ar: text, en: text });
const link = (id: string, text: string): NavigationNode => ({ id, label: label(text), href: "#" });
const group = (id: string, text: string, children: NavigationNode[]): NavigationNode => ({ id, label: label(text), href: "#", children });
const plain = (id: string, text: string): NavigationNode => ({ ...link(id, text), presentation: "plain" });
const links = (id: string, children: NavigationNode[]): NavigationNode => ({ id, label: label(""), href: "#", presentation: "links", children });

/** Menu labels and hierarchy transcribed from the supplied Arabic screenshots. */
export const siteNavigation: SiteNavigationItem[] = [
  {
    id: "about-balady",
    label: label("عن بلدي"),
    href: "#",
    children: [
      { ...group("about-us", "من نحن", [
        link("organizational-structure", "الهيكل التنظيمي"),
        link("ministry-strategy", "الهيكل الإستراتيجي للوزارة"),
        link("policies-strategies", "السياسات والاستراتيجيات"),
        link("sustainable-development", "أهداف التنمية المستدامة"),
        link("regulations", "الأنظمة واللوائح"),
        link("careers", "الوظائف"),
        link("contact-us-about", "تواصل معنا"),
      ]), presentation: "group-plain" },
      group("e-participation", "المشاركة الإلكترونية", [
        link("consultations", "الاستشارات"),
        link("participation-statement", "بيان المشاركة الالكترونية"),
        link("open-data", "البيانات المفتوحة"),
        link("feedback", "التغذية الراجعة"),
        link("co-development", "التطوير المشترك والأفكار"),
        link("social-media", "وسائل التواصل الاجتماعي"),
      ]),
      links("news-events", [
        link("news", "الأخبار"),
        link("events", "الفعاليات"),
      ]),
      links("procurement-budget", [
        link("tenders-procurement", "المناقصات والمشتريات"),
        link("budget-spending", "الميزانية والإنفاق"),
      ]),
    ],
  },
  {
    id: "knowledge-center",
    label: label("مركز المعرفة"),
    href: "#",
    active: true,
    children: [
      group("initiatives-partnerships", "مبادرات وشراكات", [
        link("initiatives", "المبادرات"),
        link("partnerships", "الشراكات"),
        link("survey-platform", "منصة استطلاع"),
        link("interaction-platform", "منصة تفاعل"),
      ]),
      {
        id: "data-statistics",
        label: label("بيانات وإحصائيات"),
        href: "#",
        presentation: "nested",
        children: [
          link("platform-open-data", "البيانات المفتوحة"),
          link("platform-statistics", "إحصائيات ومؤشرات المنصة"),
        ],
      },
    ],
  },
  {
    id: "services",
    label: label("الخدمات"),
    href: "#",
    children: [
      group("personal-pages", "الصفحات الشخصية", [
        link("manage-requests", "إدارة الطلبات"),
        link("manage-licenses", "إدارة الرخص"),
        link("control-panel", "لوحة التحكم"),
      ]),
      group("organizations-systems", "المنظمات والأنظمة", [
        link("lodging-occupancy-fee", "منصة رسم إشغال مرافق الإيواء"),
        link("tobacco-products-fee", "منصة رسم تقديم منتجات التبغ"),
        link("balady-business", "بلدي أعمال"),
        link("city-service-providers", "تصنيف مقدمي خدمات المدن"),
      ]),
      group("municipal-delegation", "التفويض البلدي الإلكتروني", [
        link("add-establishment-manager", "إضافة منشأة إلى مدير حساب"),
        link("establishment-requests", "الاستعلام عن طلبات منشأة"),
        link("establishment-delegates", "الاستعلام عن مفوضي منشأة"),
      ]),
      group("commercial-licenses", "الرخص التجارية", [
        link("issue-commercial-license", "إصدار رخصة تجارية"),
        link("renew-business-license", "تجديد رخصة نشاط تجاري"),
        link("cancel-business-license", "إلغاء رخصة نشاط تجاري"),
      ]),
      group("construction-licenses", "الرخص الإنشائية", [
        link("issue-building-license", "إصدار رخصة بناء"),
        link("issue-vacant-land-fence-license", "خدمة إصدار رخصة تسوير أراضي فضاء"),
        link("construction-services-list", "قائمة الخدمات"),
      ]),
      group("health-certificates", "الشهادات الصحية", [
        link("issue-health-certificate", "إصدار شهادة صحية"),
        link("renew-health-certificate", "تجديد شهادة صحية"),
      ]),
      group("project-coordination", "خدمات تنسيق المشروعات", [
        link("infrastructure-coordination", "خدمات تنسيق أعمال البنية التحتية"),
        link("major-project-coordination", "خدمات تنسيق المشروعات الكبرى"),
      ]),
      group("survey-report-services", "خدمات التقارير المساحية", [
        link("issue-survey-report", "إصدار تقرير مساحي"),
      ]),
    ],
  },
  {
    id: "inquiries",
    label: label("الاستعلامات"),
    href: "#",
    children: [
      group("general-inquiries", "الاستعلامات العامة", [
        link("model-contracts", "العقود النموذجية"),
        link("precautionary-measures-violations", "الاستعلام عن المخالفة للإجراءات الاحترازية"),
        link("fee-calculator", "حاسبة الرسوم المعلوماتية"),
        link("engineering-offices", "الاستعلام عن المكاتب الهندسية"),
        link("cleaning-contracts", "الاستعلام عن عقود النظافة"),
        link("mobile-vendors", "أسواق التجار المتنقلة"),
        link("commercial-signage-guide", "الدليل التنظيمي للوحات التجارية"),
      ]),
      group("land-construction", "الأراضي والبناء", [
        link("saudi-architecture", "الاستعلام عن العمارة السعودية"),
        link("building-license-inquiry", "استعلام عن رخصة بناء"),
        link("geographic-explorer", "المستكشف الجغرافي"),
        link("infrastructure-coverage-explorer", "مستكشف التغطية لخدمات البنية التحتية"),
        link("survey-report-inquiry", "الاستعلام عن تقرير مساحي"),
      ]),
      group("commercial-inquiries", "الاستعلامات التجارية", [
        link("advertising-sign-operating-license", "الاستعلام عن الرخص التشغيلية للوحات الدعائية والإعلانية"),
        link("business-activity-license-inquiry", "استعلام عن رخصة نشاط تجاري"),
        link("commercial-activities-requirements", "الأنشطة التجارية والاشتراطات البلدية"),
        link("mobile-cart-routes", "الاستعلام عن مسارات العربات المتجولة"),
      ]),
      group("honoring-the-deceased", "خدمات إكرام الموتى", [
        link("deceased-transport-services", "الاستعلام عن مقدمي خدمات نقل وتجهيز الموتى (الجهات الخيرية)"),
        link("deceased-grave-inquiry", "الاستعلام عن قبر متوفى"),
        link("burial-certificate-print", "طباعة شهادة دفن"),
        link("cemeteries-inquiry", "الاستعلام عن المقابر"),
      ]),
    ],
  },
  {
    id: "platforms",
    label: label("المنصات"),
    href: "#",
    children: [
      plain("investment-opportunities", "بوابة الفرص الاستثمارية"),
      plain("interactive-platforms", "المنصات التفاعلية"),
      plain("social-investment-challenge", "منصة تحدي الاستثمار الاجتماعي للقطاع البلدي والإسكان"),
    ],
  },
  {
    id: "contact",
    label: label("تواصل معنا"),
    href: "#",
    children: [
      links("contact-column", [
        link("contact-us", "اتصل بنا"),
        link("sign-language-support", "الدعم الفني بلغة الإشارة"),
      ]),
      links("integrity-column", [
        link("nazaha-report", "الإبلاغ عن فساد إلى (نزاهة)"),
        link("municipality-directory", "دليل الأمانات"),
      ]),
      links("misconduct-column", [
        link("suspected-corruption-report", "الإبلاغ عن شبهة فساد"),
        link("social-contact", "وسائل التواصل الاجتماعي"),
      ]),
      links("help-column", [
        link("faq", "الأسئلة الشائعة"),
        link("online-appointment", "حجز موعد إلكتروني"),
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
