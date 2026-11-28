import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { certificateInput } from "@/lib/certificate-validation";
import { certificateSnapshot } from "@/lib/certificate-snapshot";


export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "STAFF", "EDITOR"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const certificate = await db.certificate.findFirst({ where: { id, organizationId: actor.organizationId }, select: {
    id: true, certificateNumber: true, fullName: true, fullNameAr: true, identityNumber: true, gender: true, nationality: true, nationalityAr: true,
    profession: true, professionAr: true, issueDate: true, expiryDate: true, hijriIssueDate: true, hijriExpiryDate: true,
    organizationName: true, organizationNameAr: true, organizationNumber: true, licenseNumber: true, municipality: true, city: true, programType: true, programExpiryDate: true, status: true, photoKey: true,
  } });
  return certificate ? NextResponse.json(certificate) : NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "STAFF", "EDITOR"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = certificateInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR", issues: parsed.error.issues }, { status: 422 });
  if (parsed.data.photoKey && !parsed.data.photoKey.startsWith(`${actor.organizationId}/profile-photos/`)) return NextResponse.json({ error: "INVALID_PHOTO_KEY" }, { status: 422 });
  try {
    await db.$transaction(async (tx) => {
      const current = await tx.certificate.findFirst({ where: { id, organizationId: actor.organizationId } });
      if (!current) throw new Error("CERTIFICATE_NOT_FOUND");
      if (current.status === "REVOKED") throw new Error("CERTIFICATE_REVOKED");
      const input = parsed.data;
      const updated = await tx.certificate.update({ where: { id }, data: {
        ...input,
        photoKey: input.photoKey || null,
        issueDate: input.issueDate ? new Date(`${input.issueDate}T00:00:00.000Z`) : null, expiryDate: input.expiryDate ? new Date(`${input.expiryDate}T23:59:59.999Z`) : null,
        programExpiryDate: input.programExpiryDate ? new Date(`${input.programExpiryDate}T23:59:59.999Z`) : null,
        hijriIssueDate: input.hijriIssueDate || null, hijriExpiryDate: input.hijriExpiryDate || null,
      } });
      const snapshot = certificateSnapshot(updated);
      const version = await tx.certificateVersion.count({ where: { certificateId: id } });
      await tx.certificateVersion.create({ data: { certificateId: id, version: version + 1, changedById: actor.id, snapshot } });
      await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, certificateId: id, action: "CERTIFICATE_UPDATED" } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "CERTIFICATE_NOT_FOUND") return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
    if (message === "CERTIFICATE_REVOKED") return NextResponse.json({ error: "CERTIFICATE_REVOKED" }, { status: 409 });
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "CERTIFICATE_NUMBER_EXISTS" }, { status: 409 });
    throw error;
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const reason = String((await request.json().catch(() => ({})))?.reason ?? "").trim().slice(0, 500);
  const changed = await db.$transaction(async (tx) => {
    const current = await tx.certificate.findFirst({ where: { id, organizationId: actor.organizationId } });
    if (!current || current.status === "REVOKED") return false;
    const revoked = await tx.certificate.update({ where: { id }, data: { status: "REVOKED", revokedAt: new Date(), revokeReason: reason || null } });
    const snapshot = certificateSnapshot(revoked);
    const version = await tx.certificateVersion.count({ where: { certificateId: id } });
    await tx.certificateVersion.create({ data: { certificateId: id, version: version + 1, changedById: actor.id, snapshot } });
    await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, certificateId: id, action: "CERTIFICATE_REVOKED", metadata: { reason: reason || null } } });
    return true;
  });
  return changed ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "NOT_FOUND_OR_REVOKED" }, { status: 404 });
}
