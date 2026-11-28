"use client";

/* eslint-disable @next/next/no-img-element -- serve the token-scoped no-store photo directly without an image proxy cache. */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeX, Clock3, SearchX } from "lucide-react";
import PortalFrame from "@/components/layout/portal-frame";

type Status =
  | "VALID"
  | "EXPIRED"
  | "REVOKED"
  | "INVALID"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE";
type PublicCertificate = {
  identityNumber: string | null;
  hijriIssueDate: string | null;
  hijriExpiryDate: string | null;
  programType: string | null;
  programExpiryDate: string | null;
  certificateNumber: string;
  name: string;
  nameAr: string;
  nationality: string;
  nationalityAr: string;
  gender: string;
  profession: string;
  professionAr: string;
  organization: string;
  organizationAr: string;
  organizationNumber: string;
  licenseNumber: string;
  municipality: string;
  city: string;
  issueDate: string;
  expiryDate: string;
  photoAvailable: boolean;
};
type Result = { status: Status; certificate?: PublicCertificate };

const statusIcons = {
  EXPIRED: Clock3,
  REVOKED: BadgeX,
  INVALID: SearchX,
  RATE_LIMITED: Clock3,
  SERVICE_UNAVAILABLE: Clock3,
};
const statusColors = {
  VALID: "valid",
  EXPIRED: "expired",
  REVOKED: "revoked",
  INVALID: "missing",
  RATE_LIMITED: "expired",
  SERVICE_UNAVAILABLE: "missing",
};

export default function VerifyPage() {
  const { token } = useParams<{ token: string }>();
  const [result, setResult] = useState<Result | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`/api/verify/${encodeURIComponent(token)}`, { cache: "no-store" })
      .then((response) => response.json())
      .catch(() => null)
      .then(async (payload) => {
        if (!active) return;
        if (!payload) {
          setResult({ status: "SERVICE_UNAVAILABLE" });
          return;
        }
        setResult(payload as Result);
      });
    return () => {
      active = false;
    };
  }, [token]);
  const status = result?.status;
  const Icon = status && status !== "VALID" ? statusIcons[status] : null;
  const statusLabel = status
    ? {
        VALID: "سارية",
        EXPIRED: "منتهية الصلاحية",
        REVOKED: "ملغاة",
        INVALID: "لم يتم العثور على الشهادة",
        RATE_LIMITED: "محاولات كثيرة. أعد المحاولة بعد دقيقة.",
        SERVICE_UNAVAILABLE: "تعذر التحقق حالياً. أعد المحاولة لاحقاً.",
      }[status]
    : "";
  const value = (en: string | null, ar: string | null) => ar || en;
  const date = (
    raw: string | null,
    calendar: "gregory" | "islamic-umalqura" = "gregory",
    stored?: string | null,
  ) => {
    if (stored?.trim()) return stored.trim().replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) & 15));
    if (!raw) return "—";
    const parsed = new Date(raw);
    if (Number.isNaN(parsed.getTime())) return "—";
    const parts = Object.fromEntries(new Intl.DateTimeFormat(`en-GB-u-ca-${calendar}-nu-latn`, {
      year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC",
    }).formatToParts(parsed).map(part => [part.type, part.value]));
    return `${parts.year}/${parts.month}/${parts.day}`;
  };
  return (
    <PortalFrame>
      <main className="verify-page" dir="rtl" lang="ar">
        <article className="verify-card">
          <h1 className="verify-title">الشهادة الصحية</h1>
          {!result ? (
            <div className="verify-loading">
              جارٍ التحقق من الشهادة…
            </div>
          ) : (
            <>
              {result.status !== "VALID" && (
                <div className={`verify-state ${statusColors[result.status]}`}>
                  {Icon && <Icon size={20} />}
                  <b>{statusLabel}</b>
                </div>
              )}
              {result.certificate && (
                <>
                  {result.certificate.photoAvailable && (
                    <img
                      className="verify-photo"
                      src={`/api/verify/${encodeURIComponent(token)}/photo`}
                      alt="الصورة الشخصية لصاحب الشهادة"
                    />
                  )}
                  <div className="verify-fields text-right">
                    {[
                      ["الأمانة", result.certificate.municipality],
                      ["البلدية", result.certificate.city],
                      [
                        "الإسم",
                        value(
                          result.certificate.name,
                          result.certificate.nameAr,
                        ),
                      ],
                      ["رقم الهوية", result.certificate.identityNumber],
                      ["الجنس", result.certificate.gender === "MALE" ? "ذكر" : result.certificate.gender === "FEMALE" ? "أنثى" : result.certificate.gender === "OTHER" ? "آخر" : "—"],
                      [
                        "الجنسية",
                        value(
                          result.certificate.nationality,
                          result.certificate.nationalityAr,
                        ),
                      ],
                      [
                        "رقم الشهادة الصحية",
                        result.certificate.certificateNumber,
                      ],
                      [
                        "المهنة",
                        value(
                          result.certificate.profession,
                          result.certificate.professionAr,
                        ),
                      ],
                      [
                        "تاريخ إصدار الشهادة الصحية هجري",
                        date(result.certificate.issueDate, "islamic-umalqura", result.certificate.hijriIssueDate),
                      ],
                      [
                        "تاريخ إصدار الشهادة الصحية ميلادي",
                        date(result.certificate.issueDate),
                      ],
                      [
                        "تاريخ نهاية الشهادة الصحية هجري",
                        date(result.certificate.expiryDate, "islamic-umalqura", result.certificate.hijriExpiryDate),
                      ],
                      [
                        "تاريخ نهاية الشهادة الصحية ميلادي",
                        date(result.certificate.expiryDate),
                      ],
                      ["نوع البرنامج التثقيفي", result.certificate.programType],
                      ["تاريخ انتهاء البرنامج التثقيفي", date(result.certificate.programExpiryDate)],
                      ["رقم الرخصة", result.certificate.licenseNumber],
                      [
                        "إسم المنشأة",
                        value(
                          result.certificate.organization,
                          result.certificate.organizationAr,
                        ),
                      ],
                      [
                        "رقم المنشأة",
                        result.certificate.organizationNumber,
                      ],
                    ].map(([label, fieldValue]) => (
                      <div key={label}>
                        <small>{label}</small>
                        <b dir="auto">{fieldValue || "—"}</b>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </article>
      </main>
    </PortalFrame>
  );
}
