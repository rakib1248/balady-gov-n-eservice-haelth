import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { t } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";
import PortalFrame from "@/components/layout/portal-frame";

export default async function CertificatePdfPreview({ params, searchParams }: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const { id } = await params;
  const { lang } = await searchParams;
  const locale = await getLocale();
  // PDF language is independent of the website language. The reference design is Arabic.
  const pdfLocale = lang === "en" ? "en" : "ar";
  const source = `/api/certificates/${encodeURIComponent(id)}/pdf?lang=${pdfLocale}`;
  return <PortalFrame signedIn><main className="pdf-preview" dir={locale==="ar"?"rtl":"ltr"}>
    <div className="pdf-toolbar">
      <Link href="/certificates"><ArrowRight size={16}/> {t(locale,"العودة للشهادات","Back to certificates")}</Link>
      <div>
        <b>{t(locale,"معاينة الشهادة","Certificate preview")}</b>
        <span>{t(locale,"مستند شركة خاصة — ليس مستنداً حكومياً","Private company document — not government issued")}</span>
        <nav aria-label={t(locale,"لغة PDF","PDF language")} style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 6, fontSize: 11 }}>
          {(["ar", "en"] as const).map(language => <Link
            key={language}
            href={`/certificates/${encodeURIComponent(id)}/pdf?lang=${language}`}
            lang={language}
            aria-current={pdfLocale === language ? "page" : undefined}
            style={{ color: "#187a55", fontWeight: pdfLocale === language ? 700 : 400, textDecoration: pdfLocale === language ? "underline" : "none" }}
          >{language === "ar" ? "العربية" : "English"}</Link>)}
        </nav>
      </div>
      <a className="primary-button" href={`${source}&download=1`}><Download size={16}/> {t(locale,"تنزيل PDF","Download PDF")}</a>
    </div>
    <iframe title={t(locale,"معاينة الشهادة الصحية","Health certificate preview")} src={source}/>
  </main></PortalFrame>;
}
