export type BilingualLabel = { ar: string; en: string };

export type NavigationNode = {
  id: string;
  label: BilingualLabel;
} & ({ href: string } | { children: NavigationNode[] });

export const balady = (path: string) => new URL(path, "https://balady.gov.sa").href;

export const signLanguageSupport = "https://metaverse.sakani.sa/mv?q=Q4wErTyUiOpAsD7fGhJkLzXcVbNm6T9";

const link = (id: string, ar: string, en: string, path: string) =>
  ({ id, label: { ar, en }, href: balady(path) });

const group = (id: string, ar: string, en: string, children: NavigationNode[]): NavigationNode =>
  ({ id, label: { ar, en }, children });

export const siteNavigation: NavigationNode[] = [
  group("19", "عن بلدي", "About Balady", [
    group("101", "عن بلدي-1", "About Balady 1", [
      link("112", "من نحن", "About us", "/ar/about-balady/about-us"),
      link("330", "الهيكل التنظيمي", "Organizational structure", "/ar/about-balady/ministry-structure"),
      link("626", "الأنظمة واللوائح", "Rules and regulations", "/ar/about-balady/rules"),
      link("316", "السياسات والاستراتيجيات", "Policies and strategies", "/ar/about-balady/policy"),
    ]),
    group("131", "عن بلدي-2", "About Balady 2", [
      link("132", "المنافسات والمشتريات", "Tenders and procurement", "/ar/about-balady/policy/%D8%A7%D9%84%D9%85%D9%86%D8%A7%D9%81%D8%B3%D8%A7%D8%AA-%D9%88%D8%A7%D9%84%D9%85%D8%B4%D8%AA%D8%B1%D9%8A%D8%A7%D8%AA"),
      link("358", "الميزانية والمصروفات", "Budget and expenditure", "/ar/about-balady/budget-statistics"),
      link("138", "التنمية المستدامة", "Sustainable development", "/ar/about-balady/policy/%D8%A3%D9%87%D8%AF%D8%A7%D9%81-%D8%A7%D9%84%D8%AA%D9%86%D9%85%D9%8A%D8%A9-%D8%A7%D9%84%D9%85%D8%B3%D8%AA%D8%AF%D8%A7%D9%85%D8%A9"),
      link("429", "الشراكات", "Partnerships", "/ar/about-balady/partners"),
    ]),
    group("103", "عن بلدي-3", "About Balady 3", [
      link("106", "المشاركة الإلكترونية", "Electronic participation", "/ar/about-balady/e-participation"),
      link("102", "البيانات المفتوحة", "Open data", "/ar/about-balady/open-data"),
      link("378", "الأخبار", "News", "/ar/about-balady/news"),
      link("368", "الفعاليات", "Events", "/ar/about-balady/events-list"),
    ]),
    group("110", "عن بلدي-4", "About Balady 4", [
      link("121", "المبادرات", "Initiatives", "/ar/about-balady/initiatives"),
      link("116", "البيانات والإحصائيات", "Data and statistics", "/ar/about-balady/e-participation/11180"),
      link("119", "الوظائف", "Careers", "/ar/about-balady/recruitment"),
      link("107", "المساعدة والدعم", "Help and Support", "/ar/about-balady/help-and-support"),
    ]),
  ]),
  group("21", "الخدمات", "Services", [
    group("466", "الصفحات الشخصية", "Personal pages", [
      link("502", "إدارة الطلبات", "Manage requests", "https://apps.balady.gov.sa/Eservices/Inquiries/Request"),
      link("504", "إدارة الرخص", "Manage licenses", "https://apps.balady.gov.sa/Eservices/Inquiries/Licenses"),
    ]),
    group("516", "الرخص التجارية", "Commercial licenses", [
      link("518", "إصدار رخصة تجارية", "Issue a commercial license", "/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%A9"),
      link("520", "تجديد رخصة نشاط تجاري", "Renew a commercial activity license", "/ar/services/%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A%D8%A9"),
      link("522", "إلغاء رخصة نشاط تجاري", "Cancel a commercial activity license", "/ar/services/%D8%A5%D9%84%D8%BA%D8%A7%D8%A1-%D8%B1%D8%AE%D8%B5%D8%A9-%D9%86%D8%B4%D8%A7%D8%B7-%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A"),
    ]),
    group("486", "الرخص الإنشائية", "Construction licenses", [
      link("526", "إصدار رخصة بناء", "Issue a building license", "/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%A8%D9%86%D8%A7%D8%A1"),
      link("528", "خدمة إصدار رخصة تسوير أراضي فضاء", "Apply for a vacant land fencing license", "/ar/services/%D8%AE%D8%AF%D9%85%D8%A9-%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B1%D8%AE%D8%B5%D8%A9-%D8%AA%D8%B3%D9%88%D9%8A%D8%B1-%D8%A3%D8%B1%D8%A7%D8%B6%D9%8A-%D9%81%D8%B6%D8%A7%D8%A1"),
    ]),
    group("454", "الشهادات الصحية", "Health certificates", [
      link("530", "إصدار شهادة صحية", "Issue a health certificate", "/ar/services/%D8%A5%D8%B5%D8%AF%D8%A7%D8%B1-%D8%B4%D9%87%D8%A7%D8%AF%D8%A9-%D8%B5%D8%AD%D9%8A%D8%A9"),
      link("532", "تجديد شهادة صحية", "Renew a health certificate", "/ar/services/%D8%AA%D8%AC%D8%AF%D9%8A%D8%AF-%D8%B4%D9%87%D8%A7%D8%AF%D8%A9-%D8%B5%D8%AD%D9%8A%D8%A9"),
    ]),
    group("22", "إكرام الموتى", "Funeral services", [
      link("849", "تسجيل طلب نقل وتجهيز الموتى", "Request transport and preparation of the deceased", "/ar/services/%D8%AA%D8%B3%D8%AC%D9%8A%D9%84-%D8%B7%D9%84%D8%A8-%D9%86%D9%82%D9%84-%D9%88%D8%AA%D8%AC%D9%87%D9%8A%D8%B2-%D8%A7%D9%84%D9%85%D9%88%D8%AA%D9%89"),
      link("857", "حجز مقبرة", "Reserve a grave", "/ar/services/%D8%AD%D8%AC%D8%B2-%D9%85%D9%82%D8%A8%D8%B1%D8%A9"),
    ]),
    link("818", "عرض جميع الخدمات", "View all services", "/ar/all-services"),
    link("904", "منتجات بلدي", "Balady products", "/ar/all-products"),
  ]),
  link("23", "الاستعلامات", "Inquiries", "/ar/general-inquiries"),
  group("415", "المساعدة والدعم", "Help and Support", [
    link("691", "الإبلاغ عن شبهة فساد", "Report suspected corruption", "https://momah.gov.sa/ar/report-corruption"),
    link("118", "اتصل بنا", "Contact us", "/ar/help-and-support/contact-us"),
    link("399", "وسائل التواصل الإجتماعي", "Social media", "/ar/help-and-support/social-media"),
    link("419", "الأسئلة الشائعة", "Frequently asked questions", "/ar/help-and-support/faq-list"),
    link("421", "دليل فروع الوزارة / الأمانات", "Ministry branches and municipalities", "/ar/help-and-support/all"),
    link("738", "الأمانة الافتراضية", "Virtual municipality", "/ar/services/11719"),
    link("754", "حجز موعد", "Book an appointment", "https://balady.gov.sa/ar/services/%D8%AD%D8%AC%D8%B2-%D9%85%D9%88%D8%B9%D8%AF-%D8%A5%D9%84%D9%83%D8%AA%D8%B1%D9%88%D9%86%D9%8A"),
    link("423", "الدعم الفني بلغة الإشارة", "Sign language support", signLanguageSupport),
    link("746", "التواصل مع مكتب معالي الوزير", "Contact the minister’s office", "/ar/services/%D8%A7%D9%84%D8%AA%D9%88%D8%A7%D8%B5%D9%84-%D9%85%D8%B9-%D9%85%D9%83%D8%AA%D8%A8-%D9%85%D8%B9%D8%A7%D9%84%D9%8A-%D8%A7%D9%84%D9%88%D8%B2%D9%8A%D8%B1"),
  ]),
];

export const headerSearch = {
  href: balady("/ar/solr-serach-v1"),
  suggestions: [
    link("commercial", "الرخص التجارية", "Commercial licenses", "/ar/products/10920"),
    link("construction", "الرخص الإنشائية", "Construction licenses", "/ar/products/10470"),
    link("appointments", "حجز المواعيد الإلكترونية", "Book an appointment", "/ar/services/10541"),
  ],
};

// Keep the reference paths in both languages, including its English service pages.
const footerLink = (ar: string, en: string, path: string) => ({
  label: { ar, en },
  href: balady(path),
  external: !path.startsWith("/") && new URL(path).hostname !== "balady.gov.sa",
});

export const footerLinkGroups = [
  {
    title: { ar: "نظرة عامة", en: "Overview" },
    links: [
      footerLink("عن بلدي", "About Balady", "/en/about-balady/about-us"),
      footerLink("الأخبار", "News", "/en/news"),
      footerLink("الفعاليات", "Events", "/en/events-list"),
      footerLink("سياسة إخلاء المسؤولية", "Disclaimer Policy", "/en/about-balady/policy/شروط-الإستخدام-و-إخلاء-المسؤولية"),
      footerLink("شروط الاستخدام", "Terms of Use", "/en/about-balady/policy/terms-use"),
      footerLink("اتفاقية مستوى الخدمة", "Service level agreement", "/en/about-balady/policy/اتفاقية-مستوى-الخدمة"),
      footerLink("إحصائيات البوابة والخدمات", "Portal statistics and services", "/en/about-balady/e-participation/11180"),
      footerLink("النشرة البريدية", "Newsletter", "/en/newsletter"),
    ],
  },
  {
    title: { ar: "روابط مهمة", en: "Important Links" },
    links: [
      footerLink("بلدي أعمال", "Balady Business", "/en/products/10721"),
      footerLink("بوابة الموظفين", "Staff portal", "/en/node/11514"),
      footerLink("وزارة البلديات والإسكان", "Ministry of Municipalities and Housing", "https://momah.gov.sa/en"),
      footerLink("بوابة اعتماد الحكومية", "Government approval portal", "https://ebalady.momah.gov.sa/balady/faces/Login"),
      footerLink("منصة الاستشارات القانونية", "Legal advice platform", "https://istitlaa.ncc.gov.sa/ar/"),
      footerLink("المنصة الوطنية", "National Platform", "https://my.gov.sa/ar"),
      footerLink("منصة البيانات المفتوحة", "Open data platform", "https://data.gov.sa/ar"),
      footerLink("منصة استطلاع", "Istitlaa platform", "https://istitlaa.ncc.gov.sa/ar/Pages/default.aspx"),
      footerLink("منصة المشاركة", "Sharing platform", "https://eparticipation.my.gov.sa"),
      footerLink("هيئة الحكومة الرقمية", "Digital Government Authority", "https://dga.gov.sa/"),
      footerLink("المركز السعودي للأعمال", "Saudi Business Center", "https://business.sa/"),
    ],
  },
  {
    title: { ar: "المساعدة والدعم", en: "Help and Support" },
    links: [
      footerLink("مركز المساعدة والدعم", "Help and Support Center", "/en/about-balady/help-and-support"),
      footerLink("تواصل معنا", "Contact Us", "/en/help-and-support/contact-us"),
      footerLink("الأسئلة الشائعة", "Frequently Asked Questions", "/en/help-and-support/faq-list"),
      footerLink("سياسة حق الحصول على المعلومة", "Right to information policy", "/en/about-balady/policy/سياسة-حق-الحصول-على-المعلومة"),
      footerLink("سهولة الوصول", "Accessibility", "/en/about-balady/policy/سهولة-الوصول"),
      footerLink("المشاركة الرقمية", "Digital Engagement", "https://balady.gov.sa/en/about-balady/e-participation"),
      footerLink("إرسال شكوى", "Send a complaint", "/en/help-and-support/contact-us"),
      footerLink("الدليل الشامل لبوابة بلدي", "Comprehensive Guide to the Balady Portal", "https://balady.gov.sa/sites/default/files/2026-10/Comprehensive%20Guide%20to%20the%20Balady%20Portal.pdf"),
      footerLink("الإبلاغ عن فساد", "Report Corruption", "https://my.gov.sa/en/content/report-corruption"),
    ],
  },
];

export const footerPolicies = [
  footerLink("خريطة الموقع", "Sitemap", "/en/sitemap"),
  footerLink("RSS", "RSS", "/en/rss.xml"),
  footerLink("سياسة الخصوصية", "Privacy Policy", "/en/node/22490"),
];
