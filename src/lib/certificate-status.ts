import type { CertificateStatus } from "@/generated/prisma/enums";

export type DisplayStatus = "VALID" | "EXPIRED" | "REVOKED";
export type VerificationStatus = DisplayStatus | "INVALID";

export function getCertificateVerificationStatus(status: CertificateStatus | null, expiryDate: Date | null, now = new Date()): VerificationStatus {
  if (!status) return "INVALID";
  if (status === "REVOKED") return "REVOKED";
  if (!expiryDate) return status;
  const expiryDay = Date.UTC(expiryDate.getUTCFullYear(), expiryDate.getUTCMonth(), expiryDate.getUTCDate());
  const currentDay = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return expiryDay <= currentDay ? "EXPIRED" : "VALID";
}

export function getCertificateDisplayStatus(status: CertificateStatus, expiryDate: Date | null, now = new Date()): DisplayStatus {
  return getCertificateVerificationStatus(status, expiryDate, now) as DisplayStatus;
}
