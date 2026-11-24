import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { updateUserInput } from "@/lib/user-validation";

const safeUserSelect = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true } as const;

class UserActionError extends Error {
  constructor(readonly code: string, readonly status: number) { super(code); }
}

async function lockOwnerChanges(tx: Parameters<Parameters<typeof db.$transaction>[0]>[0], organizationId: string) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext(${`user-management:${organizationId}`}))`;
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const parsed = updateUserInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR", issues: parsed.error.issues }, { status: 422 });
  if (actor.id === id && parsed.data.isActive === false) return NextResponse.json({ error: "CANNOT_DEACTIVATE_SELF" }, { status: 409 });
  if (actor.id === id && parsed.data.role !== undefined) return NextResponse.json({ error: "CANNOT_CHANGE_OWN_ROLE" }, { status: 409 });

  try {
    const { password, ...userChanges } = parsed.data;
    const passwordHash = password ? await hash(password, 12) : undefined;
    const user = await db.$transaction(async (tx) => {
      await lockOwnerChanges(tx, actor.organizationId);
      const current = await tx.user.findFirst({ where: { id, organizationId: actor.organizationId }, select: safeUserSelect });
      if (!current) throw new UserActionError("USER_NOT_FOUND", 404);

      const removesActiveOwner = current.role === "OWNER" && current.isActive && (parsed.data.isActive === false || parsed.data.role !== undefined);
      if (removesActiveOwner) {
        const activeOwners = await tx.user.count({ where: { organizationId: actor.organizationId, role: "OWNER", isActive: true } });
        if (activeOwners <= 1) throw new UserActionError("LAST_ACTIVE_OWNER_REQUIRED", 409);
      }

      const updated = await tx.user.update({ where: { id }, data: { ...userChanges, ...(passwordHash ? { passwordHash } : {}) }, select: safeUserSelect });
      if (current.role !== updated.role) {
        await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, action: "USER_ROLE_CHANGED", metadata: { targetUserId: id, fromRole: current.role, toRole: updated.role } } });
      }
      if (current.isActive !== updated.isActive) {
        await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, action: updated.isActive ? "USER_REACTIVATED" : "USER_DEACTIVATED", metadata: { targetUserId: id } } });
      }
      if (current.name !== updated.name || current.email !== updated.email || passwordHash) {
        await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, action: "USER_UPDATED", metadata: { targetUserId: id } } });
      }
      return updated;
    });
    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof UserActionError) return NextResponse.json({ error: error.code }, { status: error.status });
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "EMAIL_ALREADY_EXISTS" }, { status: 409 });
    return NextResponse.json({ error: "USER_UPDATE_FAILED" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  if (actor.id === id) return NextResponse.json({ error: "CANNOT_DELETE_SELF" }, { status: 409 });

  try {
    await db.$transaction(async (tx) => {
      await lockOwnerChanges(tx, actor.organizationId);
      const target = await tx.user.findFirst({ where: { id, organizationId: actor.organizationId }, select: safeUserSelect });
      if (!target) throw new UserActionError("USER_NOT_FOUND", 404);
      if (target.role === "OWNER" && target.isActive) {
        const activeOwners = await tx.user.count({ where: { organizationId: actor.organizationId, role: "OWNER", isActive: true } });
        if (activeOwners <= 1) throw new UserActionError("LAST_ACTIVE_OWNER_REQUIRED", 409);
      }

      const [createdCertificates, changedVersions, authoredAuditLogs] = await Promise.all([
        tx.certificate.count({ where: { createdById: id } }),
        tx.certificateVersion.count({ where: { changedById: id } }),
        tx.auditLog.count({ where: { actorId: id } }),
      ]);
      if (createdCertificates + changedVersions + authoredAuditLogs > 0) throw new UserActionError("USER_HAS_HISTORY_DEACTIVATE_INSTEAD", 409);

      await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, action: "USER_DELETED", metadata: { targetUserId: target.id, role: target.role } } });
      await tx.user.delete({ where: { id } });
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof UserActionError) return NextResponse.json({ error: error.code }, { status: error.status });
    return NextResponse.json({ error: "USER_DELETE_FAILED" }, { status: 500 });
  }
}
