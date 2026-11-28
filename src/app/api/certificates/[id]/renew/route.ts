import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { z } from "zod";
import { certificateSnapshot } from "@/lib/certificate-snapshot";

const renewalSchema = z.object({ expiryDate: z.iso.date() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "STAFF", "EDITOR"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = renewalSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR" }, { status: 422 });
  const expiry = new Date(`${parsed.data.expiryDate}T23:59:59.999Z`);
  const result = await db.$transaction(async (tx) => {
    const current = await tx.certificate.findFirst({ where: { id, organizationId: actor.organizationId } });
    if (!current || current.status === "REVOKED" || (current.expiryDate && expiry <= current.expiryDate)) return false;
    const renewed = await tx.certificate.update({ where: { id }, data: { expiryDate: expiry } });
    const snapshot = certificateSnapshot(renewed);
    const version = await tx.certificateVersion.count({ where: { certificateId: id } });
    await tx.certificateVersion.create({ data: { certificateId: id, version: version + 1, changedById: actor.id, snapshot } });
    await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, certificateId: id, action: "CERTIFICATE_RENEWED", metadata: { expiryDate: parsed.data.expiryDate } } });
    return true;
  });
  return result ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "NOT_FOUND_REVOKED_OR_INVALID_EXPIRY" }, { status: 409 });
}
