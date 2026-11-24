import type { CertificateStatus } from "@/generated/prisma/enums";

export type DisplayStatus = "VALID" | "EXPIRED" | "REVOKED";

export function getCertificateDisplayStatus(status: CertificateStatus, expiryDate: Date, now = new Date()): DisplayStatus {
  if (status === "REVOKED") return "REVOKED";
  return expiryDate < now ? "EXPIRED" : "VALID";
}
