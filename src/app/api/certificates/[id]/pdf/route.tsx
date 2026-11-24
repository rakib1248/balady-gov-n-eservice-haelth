import { GetObjectCommand } from "@aws-sdk/client-s3";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { getStorage } from "@/lib/storage";
import { decryptVerificationToken } from "@/lib/verification-token";
import { CertificatePdf } from "@/lib/certificate-pdf";
import { getCertificateDisplayStatus } from "@/lib/certificate-status";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "EDITOR", "VIEWER"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const certificate = await db.certificate.findFirst({ where: { id, organizationId: actor.organizationId } });
  if (!certificate) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const token = decryptVerificationToken(certificate.verificationTokenCiphertext);
  const base = process.env.APP_BASE_URL ?? request.nextUrl.origin;
  const verificationUrl = `${base.replace(/\/$/, "")}/verify/${token}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: "H", margin: 1, width: 280 });
  let photoDataUrl: string | undefined;
  if (certificate.photoKey) {
    const storage = getStorage();
    if (storage && certificate.photoKey.startsWith(`${actor.organizationId}/profile-photos/`)) {
      try {
        const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: certificate.photoKey }));
        const bytes = await object.Body?.transformToByteArray();
        if (bytes && object.ContentType && ["image/jpeg", "image/png"].includes(object.ContentType)) photoDataUrl = `data:${object.ContentType};base64,${Buffer.from(bytes).toString("base64")}`;
      } catch { /* Keep the certificate printable if an optional portrait is unavailable. */ }
    }
  }
  const status = getCertificateDisplayStatus(certificate.status, certificate.expiryDate);
  const pdf = await renderToBuffer(<CertificatePdf data={{ ...certificate, status }} verificationUrl={verificationUrl} qrDataUrl={qrDataUrl} photoDataUrl={photoDataUrl}/>);
  const filename = `${certificate.certificateNumber}.pdf`;
  const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`, "Cache-Control": "private, no-store" } });
}
