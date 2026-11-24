import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/authorization";
import { getStorage } from "@/lib/storage";

const MAX_BYTES = 3 * 1024 * 1024;

function imageType(bytes: Uint8Array): { mime: string; extension: string } | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return { mime: "image/jpeg", extension: "jpg" };
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: "image/png", extension: "png" };
  return null;
}

export async function POST(request: NextRequest) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "EDITOR"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const storage = getStorage();
  if (!storage) return NextResponse.json({ error: "FILE_STORAGE_NOT_CONFIGURED" }, { status: 503 });
  const file = (await request.formData().catch(() => null))?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "FILE_REQUIRED" }, { status: 400 });
  if (file.size < 1 || file.size > MAX_BYTES) return NextResponse.json({ error: "FILE_SIZE_INVALID" }, { status: 413 });
  const data = new Uint8Array(await file.arrayBuffer());
  const type = imageType(data);
  if (!type) return NextResponse.json({ error: "FILE_TYPE_INVALID" }, { status: 415 });
  const key = `${actor.organizationId}/profile-photos/${randomUUID()}.${type.extension}`;
  await storage.client.send(new PutObjectCommand({ Bucket: storage.bucket, Key: key, Body: data, ContentType: type.mime, ContentLength: data.byteLength, CacheControl: "private, max-age=0, no-store", Metadata: { org: actor.organizationId } }));
  return NextResponse.json({ photoKey: key }, { status: 201 });
}
