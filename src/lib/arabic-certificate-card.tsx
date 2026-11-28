/* eslint-disable jsx-a11y/alt-text -- These images are embedded PDF resources. */
import path from "node:path";
import { readFile } from "node:fs/promises";
import { Font, Image, Link, Page, Text, View } from "@react-pdf/renderer";
import type { CertificatePdfData } from "./certificate-pdf";

export type WalletCertificateProps = {
  data: Pick<CertificatePdfData, "organizationNameAr" | "fullNameAr" | "nationalityAr" | "professionAr" | "organizationName" | "fullName" | "identityNumber" | "nationality" | "profession" | "certificateNumber" | "issueDate" | "expiryDate" | "status"> & Partial<Pick<CertificatePdfData, "hijriIssueDate" | "hijriExpiryDate">>;
  verificationUrl: string;
  qrDataUrl: string;
  photoDataUrl?: string;
};

// The measured coordinates refer to the static card artwork, including its restored left margin.
const cardWidth = 85.6 * 72 / 25.4;
const cardSize: [number, number] = [cardWidth, cardWidth * 540 / 768];
const instructionsHeight = cardWidth * 537 / 768;
const pageWidth = 595.28;
const pageHeight = 841.89;
const pageMargin = 24;
const sectionGap = 5;
const contentHeight = cardSize[1] + instructionsHeight + sectionGap;
const pageScale = Math.min((pageWidth - pageMargin * 2) / cardWidth, (pageHeight - pageMargin * 2) / contentHeight);
const x = (pixels: number) => pixels * cardSize[0] / 768;
const y = (pixels: number) => pixels * cardSize[1] / 540;
export function readArabicInstructions() {
  return readFile(path.join(process.cwd(), "public/certificate/arabic-card-instructions.png"));
}

export async function readArabicCardArtwork() {
  const [front, instructions] = await Promise.all([
    readFile(path.join(process.cwd(), "public/certificate/arabic-card-front.png")),
    readArabicInstructions(),
  ]);
  return { front, instructions };
}
const fontFamily = "Arabic certificate";
Font.register({
  family: fontFamily,
  fonts: [
    { src: path.join(process.cwd(), "public/fonts/NotoSansArabic.ttf") },
    // The 700-weight instance of the same bundled variable font.
    { src: path.join(process.cwd(), "public/fonts/NotoSansArabic-Bold.ttf"), fontWeight: 700 },
  ],
});
const pageStyle = { fontFamily, color: "#252525" };
const fullPage = { width: cardSize[0], height: cardSize[1], objectFit: "fill" } as const;

function box(left: number, top: number, width: number, height: number) {
  return { position: "absolute", left: x(left), top: y(top), width: x(width), height: y(height) } as const;
}

const hijri = new Intl.DateTimeFormat("en-GB-u-ca-islamic-umalqura-nu-latn", {
  year: "numeric", month: "2-digit", day: "2-digit", timeZone: "UTC",
});
export function dateText(stored: string | null | undefined, date: Date | null) {
  if (stored?.trim()) return latinDigits(stored.trim());
  if (!date) return "";
  const parts = Object.fromEntries(hijri.formatToParts(date).map(part => [part.type, part.value]));
  return `${parts.year}/${parts.month}/${parts.day}`;
}
function latinDigits(value: string | null) {
  return (value ?? "").replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) & 15));
}

function CardText({ value: input, left, top, width, height, size = 4.9, color = "#252525", bold = false }: {
  value: string | null; left: number; top: number; width: number; height: number; size?: number; color?: string; bold?: boolean;
}) {
  const value = input ?? "";
  const rtl = /\p{Script=Arabic}/u.test(value);
  // Keep long identifiers and names on a single line inside the printed field.
  const fontSize = Math.min(size, x(width) / Math.max(1, Array.from(value).length));
  return <View style={{ ...box(left, top, width, height), justifyContent: "center" }}>
    <Text style={{ fontSize, lineHeight: 1.4, fontWeight: bold ? 700 : 400, color, direction: rtl ? "rtl" : "ltr", textAlign: "right" }}>{value}</Text>
  </View>;
}

const statusLabels: Record<string, string> = { VALID: "سارية", EXPIRED: "منتهية الصلاحية", REVOKED: "ملغاة" };
const frame = { border: "0.5 solid #a9c98d", backgroundColor: "#f8f8f7", padding: 2.1, alignItems: "center", justifyContent: "center" } as const;

export function ArabicCertificateFront({ data, photoDataUrl, qrDataUrl, image }: WalletCertificateProps & { image: Buffer }) {
  const issuer = data.organizationNameAr || data.organizationName;
  const issuerLine = ["شهادة شركة خاصة", issuer, statusLabels[data.status ?? ""] ?? data.status].filter(Boolean).join(" · ");
  return <View style={{ width: cardSize[0], height: cardSize[1] }}>
    <Image src={image} style={fullPage}/>
    <View style={{ ...box(15, 111, 158, 176), ...frame }}>
      {photoDataUrl
        ? <Image src={photoDataUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
        : <Text style={{ fontSize: 3.4, lineHeight: 1.4, width: "100%", textAlign: "center", direction: "rtl" }}>لا توجد صورة مسجلة</Text>}
    </View>
    <View style={{ ...box(15, 303, 158, 176), ...frame }}>
      <Image src={qrDataUrl} style={{ width: x(119), height: x(119), objectFit: "contain" }}/>
    </View>
    <CardText value={data.fullNameAr || data.fullName} left={193} top={136} width={551} height={53} size={7.2} color="#087471" bold/>
    <CardText value={issuerLine} left={193} top={187} width={551} height={22} size={3.3} color="#53685e"/>
    <CardText value={data.nationalityAr || data.nationality} left={199} top={241} width={252} height={38}/>
    <CardText value={latinDigits(data.identityNumber)} left={493} top={241} width={255} height={38}/>
    <CardText value={data.professionAr || data.profession} left={199} top={338} width={252} height={38}/>
    <CardText value={data.certificateNumber} left={493} top={338} width={255} height={38}/>
    <CardText value={dateText(data.hijriExpiryDate, data.expiryDate)} left={199} top={441} width={252} height={38}/>
    <CardText value={dateText(data.hijriIssueDate, data.issueDate)} left={493} top={441} width={255} height={38}/>
    <Link src="https://x.com/balady_cs" style={box(240, 493, 104, 42)}><View/></Link>
    <Link src="https://balady.gov.sa" style={box(565, 493, 182, 42)}><View/></Link>
  </View>;
}

export function ArabicCertificateInstructions({ image }: { image: Buffer }) {
  // The supplied reverse is entirely static. Its artwork preserves the original
  // Arabic lettering, line breaks, ornamental bullets, ministry mark and watermark.
  return <View style={{ width: cardWidth, height: instructionsHeight }}>
    <Image src={image} style={{ width: cardWidth, height: instructionsHeight }}/>
  </View>;
}

export function ArabicCertificatePage({ artwork, ...props }: WalletCertificateProps & { artwork: { front: Buffer; instructions: Buffer } }) {
  return <Page size="A4" wrap={false} style={pageStyle}>
    <View style={{ height: pageHeight }}>
      <View style={{ width: cardWidth, height: contentHeight, transform: `scale(${pageScale})`, transformOrigin: "top left", marginLeft: (pageWidth - cardWidth * pageScale) / 2, marginTop: (pageHeight - contentHeight * pageScale) / 2 }}>
        <ArabicCertificateFront {...props} image={artwork.front}/>
        <View style={{ height: sectionGap }}/>
        <ArabicCertificateInstructions image={artwork.instructions}/>
      </View>
    </View>
  </Page>;
}
