"use client";

/* eslint-disable @next/next/no-img-element -- serve the token-scoped no-store photo directly without an image proxy cache. */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeX, Clock3, Printer, SearchX } from "lucide-react";
import PortalFrame from "@/components/layout/portal-frame";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/locale";

type Status = "VALID" | "EXPIRED" | "REVOKED" | "INVALID" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE";
type PublicCertificate = {
  certificateNumber: string; name: string; nameAr: string; nationality: string; nationalityAr: string;
  gender: string; profession: string; professionAr: string; organization: string; organizationAr: string;
  organizationNumber: string; licenseNumber: string; municipality: string; city: string;
  issueDate: string; expiryDate: string; photoAvailable: boolean;
};
type Result = { status: Status; certificate?: PublicCertificate };

const statusIcons = { EXPIRED: Clock3, REVOKED: BadgeX, INVALID: SearchX, RATE_LIMITED: Clock3, SERVICE_UNAVAILABLE: Clock3 };
const statusColors = { VALID: "valid", EXPIRED: "expired", REVOKED: "revoked", INVALID: "missing", RATE_LIMITED: "expired", SERVICE_UNAVAILABLE: "missing" };

export default function VerifyPage() {
  const { token } = useParams<{ token: string }>();
  const { locale } = useLocale();
  const txt = (ar: string, en: string) => t(locale, ar, en);
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`/api/verify/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((response) => response.json())
      .catch(() => null)
      .then(async (payload) => {
        if (!active) return;
        if (!payload) { setResult({ status: "SERVICE_UNAVAILABLE" }); return; }
        setResult(payload as Result);
      });
    return () => { active = false; };
  }, [token]);
  const status = result?.status;
  const Icon = status && status !== "VALID" ? statusIcons[status] : null;
  const statusLabel = status ? ({
    VALID: txt("سارية · VALID", "VALID · Certificate is active"),
    EXPIRED: txt("منتهية · EXPIRED", "EXPIRED · Certificate has expired"),
    REVOKED: txt("ملغاة · REVOKED", "REVOKED · Certificate was revoked"),
    INVALID: txt("غير صالحة · INVALID", "INVALID · Certificate not found"),
    RATE_LIMITED: txt("محاولات كثيرة. أعد المحاولة بعد دقيقة.", "Too many attempts. Retry in one minute."),
    SERVICE_UNAVAILABLE: txt("تعذر التحقق حالياً. أعد المحاولة لاحقاً.", "Verification is temporarily unavailable. Try again later."),
  })[status] : "";
  const value = (en: string, ar: string) => locale === "ar" ? ar || en : en || ar;
  const date = (raw: string, calendar: "gregory" | "islamic-umalqura" = "gregory") => new Intl.DateTimeFormat(`${locale === "ar" ? "ar-SA" : "en-US"}-u-ca-${calendar}`, { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC" }).format(new Date(raw));
  return <PortalFrame><main className="verify-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <article className="verify-card">
      {locale === "ar" && <h1 className="verify-title">شهادة صحية</h1>}
      {!result ? <div className="verify-loading">{txt("جارٍ التحقق من الشهادة…", "Verifying certificate…")}</div> : <>
        {result.status !== "VALID" && <div className={`verify-state ${statusColors[result.status]}`}>{Icon && <Icon size={20} />}<b>{statusLabel}</b></div>}
        {result.certificate && <>
          {result.certificate.photoAvailable && <img className="verify-photo" src={`/api/verify/${encodeURIComponent(token)}/photo`} alt={txt("الصورة الشخصية لصاحب الشهادة", "Certificate holder profile photo")} />}
          <div className="verify-fields">
            {[
              [txt("الأمانة", "Municipality"), result.certificate.municipality],
              [txt("البلدية", "Municipality branch"), result.certificate.city],
              [txt("الاسم", "Name"), value(result.certificate.name, result.certificate.nameAr)],
              [txt("رقم الهوية", "Identity number"), txt("غير معروض حفاظاً على الخصوصية", "Hidden for privacy")],
              [txt("الجنس", "Gender"), result.certificate.gender],
              [txt("الجنسية", "Nationality"), value(result.certificate.nationality, result.certificate.nationalityAr)],
              [txt("رقم الشهادة الصحية", "Health certificate number"), result.certificate.certificateNumber],
              [txt("المهنة", "Profession"), value(result.certificate.profession, result.certificate.professionAr)],
              [txt("تاريخ الإصدار هجري", "Hijri issue date"), date(result.certificate.issueDate, "islamic-umalqura")],
              [txt("تاريخ الإصدار ميلادي", "Gregorian issue date"), date(result.certificate.issueDate)],
              [txt("تاريخ الانتهاء هجري", "Hijri expiry date"), date(result.certificate.expiryDate, "islamic-umalqura")],
              [txt("تاريخ الانتهاء ميلادي", "Gregorian expiry date"), date(result.certificate.expiryDate)],
              [txt("المنشأة", "Organization"), value(result.certificate.organization, result.certificate.organizationAr)],
              [txt("رقم المنشأة", "Organization number"), result.certificate.organizationNumber],
              [txt("رقم الترخيص", "License number"), result.certificate.licenseNumber],
            ].map(([label, fieldValue]) => <div key={label}><small>{label}</small><b dir={[txt("رقم الشهادة الصحية", "Health certificate number"), txt("رقم المنشأة", "Organization number"), txt("رقم الترخيص", "License number")].includes(label) ? "ltr" : undefined}>{fieldValue || "—"}</b></div>)}
          </div>
        </>}
        {result.certificate && <a className="verify-print" href={`/verify/${encodeURIComponent(token)}/print`} target="_blank" rel="noopener noreferrer"><Printer size={15} />{txt("طباعة تفاصيل التحقق", "Print verification details")}</a>}
      </>}
    </article>
  </main></PortalFrame>;
}
