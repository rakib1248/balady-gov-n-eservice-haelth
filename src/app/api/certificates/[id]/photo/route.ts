import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { getStorage } from "@/lib/storage";

const MAX_BYTES = 3 * 1024 * 1024;

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "STAFF", "EDITOR"]);
  if (response || !actor) return response ?? new NextResponse(null, { status: 401 });
  const { id } = await params;
  const certificate = await db.certificate.findFirst({ where: { id, organizationId: actor.organizationId }, select: { photoKey: true } });
  if (!certificate?.photoKey || !certificate.photoKey.startsWith(`${actor.organizationId}/profile-photos/`)) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const storage = getStorage();
  if (!storage) return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: certificate.photoKey }));
    const contentType = object.ContentType?.toLowerCase();
    if (!object.Body || (contentType !== "image/jpeg" && contentType !== "image/png") || (object.ContentLength ?? Infinity) > MAX_BYTES) {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const bytes = await object.Body.transformToByteArray();
    if (bytes.byteLength > MAX_BYTES) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, { headers: { "Content-Type": contentType, "Content-Length": String(bytes.byteLength), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
  } catch {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
}
