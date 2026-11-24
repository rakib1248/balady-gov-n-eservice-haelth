import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function getActor() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.organizationId) return null;
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { id: true, name: true, email: true, role: true, organizationId: true, isActive: true } });
  if (!user || !user.isActive || user.organizationId !== session.user.organizationId) return null;
  return user;
}

export async function requireRole(allowed: string[]) {
  const actor = await getActor();
  if (!actor) return { actor: null, response: NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 }) };
  if (!allowed.includes(actor.role)) return { actor: null, response: NextResponse.json({ error: "FORBIDDEN" }, { status: 403 }) };
  return { actor, response: null };
}
