"use client";

/* eslint-disable @next/next/no-img-element -- serve the token-scoped no-store photo directly without an image proxy cache. */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { BadgeX, Clock3, SearchX } from "lucide-react";
import PortalFrame from "@/components/layout/portal-frame";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/locale";

type Status =
  | "VALID"
  | "EXPIRED"
  | "REVOKED"
  | "INVALID"
  | "RATE_LIMITED"
  | "SERVICE_UNAVAILABLE";
type PublicCertificate = {
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
        VALID: txt("سارية · VALID", "VALID · Certificate is active"),
        EXPIRED: txt("منتهية · EXPIRED", "EXPIRED · Certificate has expired"),
        REVOKED: txt("ملغاة · REVOKED", "REVOKED · Certificate was revoked"),
        INVALID: txt("غير صالحة · INVALID", "INVALID · Certificate not found"),
        RATE_LIMITED: txt(
          "محاولات كثيرة. أعد المحاولة بعد دقيقة.",
          "Too many attempts. Retry in one minute.",
        ),
        SERVICE_UNAVAILABLE: txt(
          "تعذر التحقق حالياً. أعد المحاولة لاحقاً.",
          "Verification is temporarily unavailable. Try again later.",
        ),
      }[status]
    : "";
  const value = (en: string, ar: string) => en || ar;
  const date = (
    raw: string,
    calendar: "gregory" | "islamic-umalqura" = "gregory",
  ) =>
    new Intl.DateTimeFormat(`en-US-u-ca-${calendar}-nu-latn`, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: "UTC",
    }).format(new Date(raw));
  return (
    <PortalFrame>
      <main className="verify-page" dir={locale === "ar" ? "rtl" : "ltr"}>
        <article className="verify-card">
          <h1 className="verify-title">Health Certificate</h1>
          {!result ? (
            <div className="verify-loading">
              {txt("جارٍ التحقق من الشهادة…", "Verifying certificate…")}
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
                      alt={txt(
                        "الصورة الشخصية لصاحب الشهادة",
                        "Certificate holder profile photo",
                      )}
                    />
                  )}
                  <div className="verify-fields text-right">
                    {[
                      ["Municipality", result.certificate.municipality],
                      ["Municipality branch", result.certificate.city],
                      [
                        "Name",
                        value(
                          result.certificate.name,
                          result.certificate.nameAr,
                        ),
                      ],
                      ["Identity number", "Hidden for privacy"],
                      ["Gender", result.certificate.gender],
                      [
                        "Nationality",
                        value(
                          result.certificate.nationality,
                          result.certificate.nationalityAr,
                        ),
                      ],
                      [
                        "Health certificate number",
                        result.certificate.certificateNumber,
                      ],
                      [
                        "Profession",
                        value(
                          result.certificate.profession,
                          result.certificate.professionAr,
                        ),
                      ],
                      [
                        "Date of issuance of the health certificate (Hijri calendar)",
                        date(result.certificate.issueDate, "islamic-umalqura"),
                      ],
                      [
                        "Date of issuance of the health certificate (Gregorian calendar)",
                        date(result.certificate.issueDate),
                      ],
                      [
                        " Health certificate expiry date (Hijri calendar)",
                        date(result.certificate.expiryDate, "islamic-umalqura"),
                      ],
                      [
                        "Health certificate expiry date (Gregorian calendar)",
                        date(result.certificate.expiryDate),
                      ],
                      [
                        "Organization",
                        value(
                          result.certificate.organization,
                          result.certificate.organizationAr,
                        ),
                      ],
                      [
                        "Organization number",
                        result.certificate.organizationNumber,
                      ],
                      ["License number", result.certificate.licenseNumber],
                    ].map(([label, fieldValue]) => (
                      <div key={label}>
                        <small>{label}</small>
                        <b dir="ltr">{fieldValue || "—"}</b>
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
