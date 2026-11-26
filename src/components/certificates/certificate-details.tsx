"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, Download, FilePenLine, UserRound } from "lucide-react";
import PortalFrame from "@/components/layout/portal-frame";
import { useLocale } from "@/components/locale-provider";
import { getCertificateDisplayStatus } from "@/lib/certificate-status";

type Certificate = {
  certificateNumber: string;
  fullName: string;
  fullNameAr: string;
  identityNumber: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  nationality: string;
  nationalityAr: string;
  profession: string;
  professionAr: string;
  issueDate: string;
  expiryDate: string;
  hijriIssueDate: string | null;
  hijriExpiryDate: string | null;
  organizationName: string;
  organizationNameAr: string;
  organizationNumber: string;
  licenseNumber: string;
  municipality: string;
  city: string;
  programType: string;
  programExpiryDate: string;
  status: "VALID" | "EXPIRED" | "REVOKED";
  photoKey: string | null;
};

type Field = { label: string; value: string };

export default function CertificateDetails() {
  const { id } = useParams<{ id: string }>();
  const { locale } = useLocale();
  const txt = (_ar: string, en: string) => en;
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetch(`/api/certificates/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(response.status === 401 || response.status === 403 ? "FORBIDDEN" : "NOT_FOUND");
        return payload as Certificate;
      })
      .then((payload) => { if (active) setCertificate(payload); })
      .catch((cause: unknown) => { if (active) setError(cause instanceof Error ? cause.message : "NOT_FOUND"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const status = useMemo(() => certificate ? getCertificateDisplayStatus(certificate.status, new Date(certificate.expiryDate)) : null, [certificate]);
  const date = (raw: string | null) => raw ? new Intl.DateTimeFormat("en-US-u-nu-latn", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(raw)) : "—";
  const englishGender = certificate ? ({ MALE: "Male", FEMALE: "Female", OTHER: "Other" })[certificate.gender] : "";
  const englishValue = (english: string, arabic: string) => english || arabic;
  const englishHijriDate = (raw: string | null) => raw
    ? raw
      .replace(/[٠-٩۰-۹]/g, digit => String("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹".indexOf(digit) % 10))
      .replace(/هـ/g, "AH")
    : "—";

  const personalFields: Field[] = certificate ? [
    { label: "Municipality", value: certificate.municipality },
    { label: "Municipality branch", value: certificate.city },
    { label: "Name", value: englishValue(certificate.fullName, certificate.fullNameAr) },
    { label: "Identity / residency number", value: certificate.identityNumber },
    { label: "Gender", value: englishGender },
    { label: "Nationality", value: englishValue(certificate.nationality, certificate.nationalityAr) },
    { label: "Profession", value: englishValue(certificate.profession, certificate.professionAr) },
  ] : [];
  const certificateFields: Field[] = certificate ? [
    { label: "Health certificate number", value: certificate.certificateNumber },
    { label: "Issue date (Hijri)", value: englishHijriDate(certificate.hijriIssueDate) },
    { label: "Issue date (Gregorian)", value: date(certificate.issueDate) },
    { label: "Expiry date (Hijri)", value: englishHijriDate(certificate.hijriExpiryDate) },
    { label: "Expiry date (Gregorian)", value: date(certificate.expiryDate) },
    { label: "Education program", value: certificate.programType },
    { label: "Program expiry date", value: date(certificate.programExpiryDate) },
  ] : [];
  const organizationFields: Field[] = certificate ? [
    { label: "Organization name", value: englishValue(certificate.organizationName, certificate.organizationNameAr) },
    { label: "Organization number", value: certificate.organizationNumber },
    { label: "License number", value: certificate.licenseNumber },
  ] : [];

  const renderFields = (fields: Field[]) => <div className="certificate-detail-grid">{fields.map((field) => <div className="certificate-detail-field" key={field.label}><span>{field.label}</span><b>{field.value || "—"}</b></div>)}</div>;

  return <PortalFrame signedIn><main className="form-page certificate-page certificate-details-page" dir={locale === "ar" ? "rtl" : "ltr"}>
    <div className="form-heading certificate-details-heading">
      <Link href="/certificates" className="back-link"><ArrowRight size={16} />{txt("العودة للشهادات", "Back to certificates")}</Link>
      <h1>{txt("تفاصيل الشهادة الصحية", "Health certificate details")}</h1>
      {status && <span className={`status-pill ${status === "VALID" ? "valid" : status === "EXPIRED" ? "expired" : "revoked"}`}>{status === "VALID" ? txt("سارية · VALID", "VALID") : status === "EXPIRED" ? txt("منتهية · EXPIRED", "EXPIRED") : txt("ملغاة · REVOKED", "REVOKED")}</span>}
    </div>

    {loading ? <p className="certificate-details-message">{txt("جارٍ تحميل بيانات الشهادة…", "Loading certificate details…")}</p> : error ? <p className="certificate-details-message" role="alert">{error === "FORBIDDEN" ? txt("ليس لديك صلاحية عرض هذه الشهادة.", "You do not have permission to view this certificate.") : txt("لم يتم العثور على الشهادة.", "Certificate not found.")}</p> : certificate ? <>
      <div className="certificate-details-actions">
        <Link href={`/certificates/${encodeURIComponent(id)}/edit`}><FilePenLine size={15} />{txt("تعديل", "Edit")}</Link>
        <Link href={`/certificates/${encodeURIComponent(id)}/pdf`}><Download size={15} />{txt("معاينة / تنزيل PDF", "Preview / download PDF")}</Link>
      </div>
      {certificate.photoKey && <div className="certificate-photo-block certificate-details-photo"><div className="photo-preview-frame">
        <Image src={`/api/certificates/${encodeURIComponent(id)}/photo`} alt={txt("صورة حامل الشهادة", "Certificate holder photo")} width={180} height={165} unoptimized />
      </div></div>}
      <section className="certificate-detail-section"><h2>{txt("بيانات المستفيد", "Certificate holder")}</h2>{renderFields(personalFields)}</section>
      <section className="certificate-detail-section"><h2>{txt("بيانات الشهادة", "Certificate information")}</h2>{renderFields(certificateFields)}</section>
      <section className="certificate-detail-section"><h2>{txt("بيانات المنشأة", "Organization information")}</h2>{renderFields(organizationFields)}</section>
      <p className="form-disclaimer">{txt("بيانات خاصة متاحة للمستخدمين المخوّلين فقط.", "Private details are visible only to authorized users.")}</p>
    </> : <div className="certificate-details-empty"><UserRound size={24} /></div>}
  </main></PortalFrame>;
}
