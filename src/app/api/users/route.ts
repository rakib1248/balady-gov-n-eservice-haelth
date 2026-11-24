import { hash } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { createUserInput, userRoleFilter } from "@/lib/user-validation";

const safeUserSelect = { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true } as const;

export async function GET(request: NextRequest) {
  const { actor, response } = await requireRole(["OWNER"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const params = request.nextUrl.searchParams;
  const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
  const pageSize = Math.min(50, Math.max(1, Number(params.get("pageSize") ?? 10) || 10));
  const query = params.get("q")?.trim().slice(0, 160);
  const rawRole = params.get("role");
  const parsedRole = rawRole ? userRoleFilter.safeParse(rawRole) : null;
  if (rawRole && !parsedRole?.success) return NextResponse.json({ error: "INVALID_ROLE_FILTER" }, { status: 422 });
  const where = {
    organizationId: actor.organizationId,
    ...(parsedRole?.success ? { role: parsedRole.data } : {}),
    ...(query ? { OR: [{ name: { contains: query, mode: "insensitive" as const } }, { email: { contains: query, mode: "insensitive" as const } }] } : {}),
  };
  const [total, activeOwners, users] = await Promise.all([
    db.user.count({ where }),
    db.user.count({ where: { organizationId: actor.organizationId, role: "OWNER", isActive: true } }),
    db.user.findMany({ where, select: safeUserSelect, orderBy: [{ role: "asc" }, { name: "asc" }], skip: (page - 1) * pageSize, take: pageSize }),
  ]);
  const items = users.map((user) => ({ ...user, isLastActiveOwner: user.role === "OWNER" && user.isActive && activeOwners <= 1 }));
  return NextResponse.json({ items, page, pageSize, total, pages: Math.ceil(total / pageSize) });
}

export async function POST(request: NextRequest) {
  const { actor, response } = await requireRole(["OWNER"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const parsed = createUserInput.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "VALIDATION_ERROR", issues: parsed.error.issues }, { status: 422 });

  try {
    const { password, ...userData } = parsed.data;
    const passwordHash = await hash(password, 12);
    const user = await db.$transaction(async (tx) => {
      const created = await tx.user.create({ data: { ...userData, passwordHash, organizationId: actor.organizationId }, select: safeUserSelect });
      await tx.auditLog.create({ data: { organizationId: actor.organizationId, actorId: actor.id, action: "USER_CREATED", metadata: { targetUserId: created.id, role: created.role } } });
      return created;
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") return NextResponse.json({ error: "EMAIL_ALREADY_EXISTS" }, { status: 409 });
    return NextResponse.json({ error: "USER_CREATE_FAILED" }, { status: 500 });
  }
}
