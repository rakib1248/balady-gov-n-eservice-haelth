import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { t } from "@/lib/locale";
import { getLocale } from "@/lib/locale-server";
import LocaleToggle from "@/components/locale-toggle";

export default async function CertificatePdfPreview({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const locale = await getLocale();
  const source = `/api/certificates/${encodeURIComponent(id)}/pdf`;
  return <main className="pdf-preview" dir={locale==="ar"?"rtl":"ltr"}><header><Link href="/certificates"><ArrowRight size={16}/> {t(locale,"العودة للشهادات","Back to certificates")}</Link><div><b>{t(locale,"معاينة الشهادة","Certificate preview")}</b><span>{t(locale,"مستند شركة خاصة — ليس مستنداً حكومياً","Private company document — not government issued")}</span></div><LocaleToggle/><a className="primary-button" href={`${source}?download=1`}><Download size={16}/> {t(locale,"تنزيل PDF","Download PDF")}</a></header><iframe title={t(locale,"معاينة الشهادة الصحية","Health certificate preview")} src={source}/></main>;
}
