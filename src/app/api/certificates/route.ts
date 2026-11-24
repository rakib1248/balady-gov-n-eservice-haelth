import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { certificateInput } from "@/lib/certificate-validation";
import { createVerificationToken } from "@/lib/verification-token";
import { certificateSnapshot } from "@/lib/certificate-snapshot";
import { getCertificateDisplayStatus } from "@/lib/certificate-status";


export async function GET(request: NextRequest) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "STAFF", "EDITOR", "VIEWER"]);
  if (response || !actor) return response;
  const page = Math.max(1, Number(request.nextUrl.searchParams.get("page") ?? 1) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("pageSize") ?? 20) || 20));
  const query = request.nextUrl.searchParams.get("q")?.trim().slice(0, 160);
  const requestedStatus = request.nextUrl.searchParams.get("status");
  const now = new Date();
  const where = {
    organizationId: actor.organizationId,
    ...(query ? { OR: [{ certificateNumber: { contains: query, mode: "insensitive" as const } }, { fullName: { contains: query, mode: "insensitive" as const } }, { fullNameAr: { contains: query, mode: "insensitive" as const } }] } : {}),
    ...(requestedStatus === "REVOKED" ? { status: "REVOKED" as const } : requestedStatus === "EXPIRED" ? { status: "VALID" as const, expiryDate: { lt: now } } : requestedStatus === "VALID" ? { status: "VALID" as const, expiryDate: { gte: now } } : {}),
  };
  const [total, rows] = await Promise.all([
    db.certificate.count({ where }),
    db.certificate.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * pageSize, take: pageSize, select: { id: true, certificateNumber: true, fullName: true, fullNameAr: true, profession: true, professionAr: true, organizationName: true, organizationNameAr: true, issueDate: true, expiryDate: true, status: true, createdAt: true } }),
  ]);
  const items = rows.map((row) => ({ ...row, status: getCertificateDisplayStatus(row.status, row.expiryDate, now) }));
  return NextResponse.json({ items, page, pageSize, total, pages: Math.ceil(total / pageSize) });
}

export async function POST(request: NextRequest) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "STAFF", "EDITOR"]);
  if (response || !actor) return response;
  const parsed = certificateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR", issues: parsed.error.issues }, { status: 422 });
  const input = parsed.data;
  if (input.photoKey && !input.photoKey.startsWith(`${actor.organizationId}/profile-photos/`)) return NextResponse.json({ error: "INVALID_PHOTO_KEY" }, { status: 422 });
  let generated: ReturnType<typeof createVerificationToken>;
  try { generated = createVerificationToken(); }
  catch { return NextResponse.json({ error: "TOKEN_ENCRYPTION_NOT_CONFIGURED" }, { status: 503 }); }
  try {
    const result = await db.$transaction(async (tx) => {
      const certificate = await tx.certificate.create({ data: {
        ...input,
        photoKey: input.photoKey || null,
        issueDate: new Date(`${input.issueDate}T00:00:00.000Z`),
        expiryDate: new Date(`${input.expiryDate}T23:59:59.999Z`),
        programExpiryDate: new Date(`${input.programExpiryDate}T23:59:59.999Z`),
        hijriIssueDate: input.hijriIssueDate || null,
        hijriExpiryDate: input.hijriExpiryDate || null,
        organizationId: actor.organizationId,
        createdById: actor.id,
        verificationTokenHash: generated.hash,
        verificationTokenCiphertext: generated.ciphertext,
      } });
      const snapshot = certificateSnapshot(certificate);
      await tx.certificateVersion.create({ data: { certificateId: certificate.id, version: 1, changedById: actor.id, snapshot } });
      await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, certificateId: certificate.id, action: "CERTIFICATE_CREATED" } });
      return certificate;
    });
    return NextResponse.json({ id: result.id, certificateNumber: result.certificateNumber, verificationToken: generated.token }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "CERTIFICATE_NUMBER_EXISTS" }, { status: 409 });
    throw error;
  }
}
