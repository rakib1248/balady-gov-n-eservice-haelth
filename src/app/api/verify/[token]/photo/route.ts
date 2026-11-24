import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getPublicPhoto } from "@/lib/public-verification";
import { getStorage } from "@/lib/storage";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const photo = await getPublicPhoto(token);
  if (!photo?.photoKey || !photo.organizationId || !photo.photoKey.startsWith(`${photo.organizationId}/profile-photos/`)) {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
  const storage = getStorage();
  if (!storage) return new NextResponse(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: photo.photoKey }));
    const contentType = object.ContentType?.toLowerCase();
    if (!object.Body || (contentType !== "image/jpeg" && contentType !== "image/png") || (object.ContentLength ?? Infinity) > 3 * 1024 * 1024) {
      return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    }
    const bytes = await object.Body.transformToByteArray();
    if (bytes.byteLength > 3 * 1024 * 1024) return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
    const body = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(body).set(bytes);
    return new NextResponse(body, { headers: { "Content-Type": contentType, "Content-Length": String(bytes.byteLength), "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff", "Content-Disposition": "inline" } });
  } catch {
    return new NextResponse(null, { status: 404, headers: { "Cache-Control": "no-store" } });
  }
}
