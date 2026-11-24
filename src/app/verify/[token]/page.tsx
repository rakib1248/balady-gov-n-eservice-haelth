"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeCheck, BadgeX, Clock3, Printer, SearchX, ShieldCheck } from "lucide-react";
import PortalFrame from "@/components/layout/portal-frame";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/locale";

type Status = "VALID" | "EXPIRED" | "REVOKED" | "INVALID" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE";
type PublicCertificate = {
  certificateNumber: string; name: string; nameAr: string; nationality: string; nationalityAr: string;
  gender: string; profession: string; professionAr: string; organization: string; organizationAr: string;
  organizationNumber: string; licenseNumber: string; municipality: string; city: string;
  issueDate: string; expiryDate: string;
};
type Result = { status: Status; certificate?: PublicCertificate };

const statusIcons = { VALID: BadgeCheck, EXPIRED: Clock3, REVOKED: BadgeX, INVALID: SearchX, RATE_LIMITED: Clock3, SERVICE_UNAVAILABLE: Clock3 };
const statusColors = { VALID: "valid", EXPIRED: "expired", REVOKED: "revoked", INVALID: "missing", RATE_LIMITED: "expired", SERVICE_UNAVAILABLE: "missing" };

export default function VerifyPage() {
  const { token } = useParams<{ token: string }>();
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => t(locale, ar, en);
  const [result, setResult] = useState<Result | null>(null);
  const [checkedAt, setCheckedAt] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`/api/verify/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((response) => response.json())
      .catch(() => null)
      .then(async (payload) => {
        if (!active) return;
        if (!payload) { setResult({ status: "SERVICE_UNAVAILABLE" }); return; }
        setResult(payload as Result);
        setCheckedAt(new Date().toISOString());
      });
    return () => { active = false; };
  }, [token]);
  const status = result?.status;
  const Icon = status ? statusIcons[status] : null;
  const statusLabel = status ? ({
    VALID: txt("سارية · VALID", "VALID · Certificate is active"),
    EXPIRED: txt("منتهية · EXPIRED", "EXPIRED · Certificate has expired"),
    REVOKED: txt("ملغاة · REVOKED", "REVOKED · Certificate was revoked"),
    INVALID: txt("غير صالحة · INVALID", "INVALID · Certificate not found"),
    RATE_LIMITED: txt("محاولات كثيرة. أعد المحاولة بعد دقيقة.", "Too many attempts. Retry in one minute."),
    SERVICE_UNAVAILABLE: txt("تعذر التحقق حالياً. أعد المحاولة لاحقاً.", "Verification is temporarily unavailable. Try again later."),
  })[status] : "";
  const value = (en: string, ar: string) => locale === "ar" ? ar || en : en || ar;
  const date = (raw: string) => new Date(raw).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "long", day: "numeric" });

  return <PortalFrame><main className="verify-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <article className="verify-card">
      <div className="private-document"><ShieldCheck size={17} /><span>{txt("شهادة شركة خاصة — ليست مستنداً حكومياً", "Private Company Certificate – Not a Government Document")}</span></div>
      {!result ? <div className="verify-loading">{txt("جارٍ التحقق من الشهادة…", "Verifying certificate…")}</div> : <>
        <div className={`verify-state ${statusColors[result.status]}`}>{Icon && <Icon size={25} />}<b>{statusLabel}</b></div>
        {checkedAt && <p className="verify-timestamp">{txt("وقت التحقق", "Verified at")}: <time dir="ltr">{new Intl.DateTimeFormat(locale === "ar" ? "ar-SA" : "en-US", { dateStyle: "medium", timeStyle: "short" }).format(new Date(checkedAt))}</time></p>}
        {result.certificate && <>
          <section className="verify-holder">
            <div><small>{txt("حامل الشهادة", "Certificate holder")}</small><h1>{value(result.certificate.name, result.certificate.nameAr)}</h1><span>{value(result.certificate.nameAr, result.certificate.name)}</span></div>
          </section>
          <div className="verify-number"><small>{txt("رقم الشهادة", "Certificate number")}</small><b dir="ltr">{result.certificate.certificateNumber}</b></div>
          <div className="verify-fields">
            {[
              [txt("الجنسية", "Nationality"), value(result.certificate.nationality, result.certificate.nationalityAr)],
              [txt("الجنس", "Gender"), result.certificate.gender],
              [txt("المهنة", "Profession"), value(result.certificate.profession, result.certificate.professionAr)],
              [txt("المنشأة", "Organization"), value(result.certificate.organization, result.certificate.organizationAr)],
              [txt("رقم المنشأة", "Organization number"), result.certificate.organizationNumber],
              [txt("رقم الترخيص", "License number"), result.certificate.licenseNumber],
              [txt("البلدية", "Municipality"), result.certificate.municipality],
              [txt("المدينة", "City"), result.certificate.city],
              [txt("تاريخ الإصدار", "Issue date"), date(result.certificate.issueDate)],
              [txt("تاريخ الانتهاء", "Expiry date"), date(result.certificate.expiryDate)],
            ].map(([label, fieldValue]) => <div key={label}><small>{label}</small><b>{fieldValue || "—"}</b></div>)}
          </div>
        </>}
        <button type="button" className="verify-print" onClick={() => window.print()}><Printer size={16} />{txt("طباعة تفاصيل التحقق", "Print verification details")}</button>
      </>}
      <p className="verify-note">{txt("تعرض هذه الصفحة المعلومات المعتمدة للتحقق فقط. لا يتم عرض رقم الهوية أو الصورة الشخصية أو بيانات الدخول.", "Only approved information is shown for verification. Identity numbers, profile photos, and login details are not displayed.")}</p>
      <p className="verify-disclaimer">{txt("هذه شهادة صادرة عن شركة خاصة مستقلة، وليست وثيقة حكومية ولا تمثل أي جهة حكومية.", "This certificate is issued by an independent private company. It is not a government document and does not represent any government authority.")}</p>
    </article>
  </main></PortalFrame>;
}
