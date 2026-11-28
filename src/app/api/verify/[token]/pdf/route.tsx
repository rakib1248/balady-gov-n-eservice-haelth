import { GetObjectCommand } from "@aws-sdk/client-s3";
import { renderToBuffer } from "@react-pdf/renderer";
import QRCode from "qrcode";
import { NextRequest, NextResponse } from "next/server";
import { getPdfLocale } from "@/lib/locale-server";
import { readArabicCardArtwork } from "@/lib/arabic-certificate-card";
import { CertificatePdf } from "@/lib/certificate-pdf";
import { getPublicPhoto, resolvePublicVerification } from "@/lib/public-verification";
import { getStorage } from "@/lib/storage";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const forwarded = request.headers.get("x-nf-client-connection-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const result = await resolvePublicVerification(token, forwarded);
  if (!result.certificate) {
    const status = result.status === "RATE_LIMITED" ? 429 : result.status === "SERVICE_UNAVAILABLE" ? 503 : 404;
    return NextResponse.json({ error: result.status }, {
      status,
      headers: { "Cache-Control": "no-store, private", ...(status === 429 ? { "Retry-After": "60" } : {}) },
    });
  }

  try {
    const base = process.env.APP_BASE_URL ?? request.nextUrl.origin;
    const verificationUrl = `${base.replace(/\/$/, "")}/verify/${token}`;
    const qrDataUrl = await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 480,
      type: "image/png",
      color: { dark: "#19352a", light: "#ffffff" },
    });

    let photoDataUrl: string | undefined;
    const photo = result.certificate.photoAvailable ? await getPublicPhoto(token) : null;
    const storage = getStorage();
    if (photo?.photoKey && storage && photo.photoKey.startsWith(`${photo.organizationId}/profile-photos/`)) {
      try {
        const object = await storage.client.send(new GetObjectCommand({ Bucket: storage.bucket, Key: photo.photoKey }));
        const bytes = await object.Body?.transformToByteArray();
        if (bytes && object.ContentType && ["image/jpeg", "image/png"].includes(object.ContentType)) {
          photoDataUrl = `data:${object.ContentType};base64,${Buffer.from(bytes).toString("base64")}`;
        }
      } catch {
        // The public certificate remains printable when its optional portrait is unavailable.
      }
    }

    const certificate = result.certificate;
    const locale = await getPdfLocale(request.nextUrl.searchParams.get("lang"));
    if (locale === "ar" && certificate.photoAvailable && !photoDataUrl) {
      return NextResponse.json({ error: "PHOTO_UNAVAILABLE" }, { status: 503, headers: { "Cache-Control": "private, no-store" } });
    }
    const artwork = locale === "ar" ? await readArabicCardArtwork() : undefined;
    const disposition = request.nextUrl.searchParams.get("download") === "1" ? "attachment" : "inline";
    const pdf = await renderToBuffer(<CertificatePdf
      artwork={artwork}
      data={{
        fullName: certificate.name,
        fullNameAr: certificate.nameAr,
        identityNumber: locale === "ar" ? null : "Hidden for privacy",
        gender: certificate.gender,
        nationality: certificate.nationality,
        nationalityAr: certificate.nationalityAr,
        profession: certificate.profession,
        professionAr: certificate.professionAr,
        certificateNumber: certificate.certificateNumber,
        issueDate: certificate.issueDate,
        expiryDate: certificate.expiryDate,
        hijriIssueDate: null,
        hijriExpiryDate: null,
        organizationName: certificate.organization,
        organizationNameAr: certificate.organizationAr,
        organizationNumber: certificate.organizationNumber,
        licenseNumber: certificate.licenseNumber,
        municipality: certificate.municipality,
        city: certificate.city,
        status: result.status,
      }}
      verificationUrl={verificationUrl}
      qrDataUrl={qrDataUrl}
      photoDataUrl={photoDataUrl}
    />);
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${disposition}; filename*=UTF-8''${encodeURIComponent(`${certificate.certificateNumber || "certificate"}.pdf`)}`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "PDF_UNAVAILABLE" }, { status: 500, headers: { "Cache-Control": "no-store, private" } });
  }
}
