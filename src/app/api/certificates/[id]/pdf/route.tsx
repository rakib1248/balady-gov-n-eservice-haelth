import { GetObjectCommand } from "@aws-sdk/client-s3";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/authorization";
import { getStorage } from "@/lib/storage";
import { decryptVerificationToken } from "@/lib/verification-token";
import { getPdfLocale } from "@/lib/locale-server";
import { readArabicCardArtwork } from "@/lib/arabic-certificate-card";
import { AdminCertificatePdf } from "@/lib/admin-certificate-pdf";
import { CertificatePdf2 } from "@/lib/certificate-pdf2";
import { getCertificateDisplayStatus } from "@/lib/certificate-status";


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { actor, response } = await requireRole(["OWNER", "ADMIN", "STAFF", "EDITOR", "VIEWER"]);
  if (response || !actor) return response ?? NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { id } = await params;
  const certificate = await db.certificate.findFirst({ where: { id, organizationId: actor.organizationId } });
  if (!certificate) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  const token = decryptVerificationToken(certificate.verificationTokenCiphertext);
  const base = process.env.APP_BASE_URL ?? request.nextUrl.origin;
  const verificationUrl = `${base.replace(/\/$/, "")}/verify/${token}`;
  const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
    errorCorrectionLevel: "H",
    margin: 4,
    width: 960,
    type: "image/png",
    color: { dark: "#19352a", light: "#ffffff" },
  });
  let photoDataUrl: string | undefined;
  if (certificate.photoKey) {
    const storage = getStorage();
    if (storage && certificate.photoKey.startsWith(`${actor.organizationId}/profile-photos/`)) {
      try {
        const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: certificate.photoKey }));
        const bytes = await object.Body?.transformToByteArray();
        if (bytes && object.ContentType && ["image/jpeg", "image/png"].includes(object.ContentType)) photoDataUrl = `data:${object.ContentType};base64,${Buffer.from(bytes).toString("base64")}`;
      } catch { /* Report a temporarily unavailable stored portrait below. */ }
    }
    if (!photoDataUrl) return NextResponse.json({ error: "PHOTO_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
  }
  const status = getCertificateDisplayStatus(certificate.status, certificate.expiryDate);
  const isPdf2 = request.nextUrl.searchParams.get("design") === "pdf2";
  const props = { data: { ...certificate, status }, verificationUrl, qrDataUrl, photoDataUrl };
  const locale = await getPdfLocale(request.nextUrl.searchParams.get("lang"));
  const document = isPdf2
    ? <CertificatePdf2 {...props}/>
    : locale === "en"
      ? <AdminCertificatePdf {...props} locale="en"/>
      : <AdminCertificatePdf {...props} locale="ar" artwork={await readArabicCardArtwork()}/>;
  const pdf = await renderToBuffer(document);
  const filename = `${certificate.certificateNumber || "certificate"}${isPdf2 ? "-PDF2" : ""}.pdf`;
  const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
  return new NextResponse(new Uint8Array(pdf), { headers: { "Content-Type": "application/pdf", "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`, "Cache-Control": "private, no-store" } });
}
