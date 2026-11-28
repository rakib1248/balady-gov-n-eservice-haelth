import "server-only";

import { createHash, createHmac } from "node:crypto";
import { db } from "@/lib/db";
import { getCertificateVerificationStatus } from "@/lib/certificate-status";

export type VerificationStatus = "VALID" | "EXPIRED" | "REVOKED" | "INVALID" | "RATE_LIMITED" | "SERVICE_UNAVAILABLE";

export type PublicCertificate = {
  identityNumber: string | null;
  hijriIssueDate: string | null;
  hijriExpiryDate: string | null;
  programType: string | null;
  programExpiryDate: Date | null;
  certificateNumber: string | null;
  name: string | null;
  nameAr: string | null;
  nationality: string | null;
  nationalityAr: string | null;
  gender: string | null;
  profession: string | null;
  professionAr: string | null;
  issueDate: Date | null;
  expiryDate: Date | null;
  organization: string | null;
  organizationAr: string | null;
  organizationNumber: string | null;
  licenseNumber: string | null;
  municipality: string | null;
  city: string | null;
  photoAvailable: boolean;
};

export type VerificationResult = { status: VerificationStatus; certificate?: PublicCertificate };

export async function resolvePublicVerification(token: string, clientAddress: string): Promise<VerificationResult> {
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return { status: "INVALID" };
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) return { status: "SERVICE_UNAVAILABLE" };

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const ipHash = createHmac("sha256", secret).update(clientAddress).digest("hex");
  const rateKey = `verification:${ipHash}`;
  const window = new Date(Math.floor(Date.now() / 60_000) * 60_000);
  const buckets = await db.$queryRaw<Array<{ hits: number }>>`INSERT INTO "PublicRateLimit" ("key", "window", "hits") VALUES (${rateKey}, ${window}, 1) ON CONFLICT ("key") DO UPDATE SET "hits" = CASE WHEN "PublicRateLimit"."window" = EXCLUDED."window" THEN "PublicRateLimit"."hits" + 1 ELSE 1 END, "window" = EXCLUDED."window" RETURNING "hits"`;
  if ((buckets[0]?.hits ?? 0) > 30) return { status: "RATE_LIMITED" };

  const record = await db.certificate.findUnique({ where: { verificationTokenHash: tokenHash }, select: {
    id: true, identityNumber: true, hijriIssueDate: true, hijriExpiryDate: true, programType: true, programExpiryDate: true, certificateNumber: true, fullName: true, fullNameAr: true, nationality: true, nationalityAr: true, gender: true,
    profession: true, professionAr: true, issueDate: true, expiryDate: true, status: true, photoKey: true,
    organizationName: true, organizationNameAr: true, organizationNumber: true, licenseNumber: true, municipality: true, city: true,
  } });
  const status = getCertificateVerificationStatus(record?.status ?? null, record?.expiryDate ?? null);
  await db.verificationLog.create({ data: { certificateId: record?.id ?? null, tokenHash, outcome: status, ipHash } });
  if (!record) return { status };

  return {
    status,
    certificate: {
      identityNumber: record.identityNumber,
      hijriIssueDate: record.hijriIssueDate,
      hijriExpiryDate: record.hijriExpiryDate,
      programType: record.programType,
      programExpiryDate: record.programExpiryDate,
      certificateNumber: record.certificateNumber,
      name: record.fullName,
      nameAr: record.fullNameAr,
      nationality: record.nationality,
      nationalityAr: record.nationalityAr,
      gender: record.gender,
      profession: record.profession,
      professionAr: record.professionAr,
      issueDate: record.issueDate,
      expiryDate: record.expiryDate,
      organization: record.organizationName,
      organizationAr: record.organizationNameAr,
      organizationNumber: record.organizationNumber,
      licenseNumber: record.licenseNumber,
      municipality: record.municipality,
      city: record.city,
      photoAvailable: Boolean(record.photoKey),
    },
  };
}

export async function getPublicPhoto(token: string) {
  if (!/^[A-Za-z0-9_-]{40,50}$/.test(token)) return null;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  return db.certificate.findUnique({ where: { verificationTokenHash: tokenHash }, select: { organizationId: true, photoKey: true } });
}
