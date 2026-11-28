/* eslint-disable jsx-a11y/alt-text -- Images are embedded PDF resources. */
import path from "node:path";
import { Document, Font, Image, Page, Text, View } from "@react-pdf/renderer";
import { dateText, type WalletCertificateProps } from "./arabic-certificate-card";

// desing-reference/pdf2.pdf: one 242.64 × 153.12 pt card, a 1011 × 638 px design.
// scripts/pdf2-artwork.mts extracts its static artwork with empty data fields.
// Its sample identity, portrait and QR are never embedded in generated documents.
const scale = 0.24;
const fontFamily = "PDF2 Arabic";
Font.register({ family: fontFamily, src: path.join(process.cwd(), "public/fonts/NotoSansArabic.ttf") });
const box = (left: number, top: number, width: number, height: number) => ({
  position: "absolute" as const, left: left * scale, top: top * scale, width: width * scale, height: height * scale,
});

function Value({ value, left, top, width = 354, height = 44, size = 5.3, name = false }: {
  value: string | null | undefined; left: number; top: number; width?: number; height?: number; size?: number; name?: boolean;
}) {
  const text = (value ?? "").replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) & 15));
  const arabic = /\p{Script=Arabic}/u.test(text);
  const fontSize = Math.min(size, (width - 20) * scale / Math.max(1, Array.from(text).length * 0.66));
  return <View style={{ ...box(left, top, width, height), justifyContent: "center", paddingHorizontal: 8 * scale, backgroundColor: name ? undefined : "#ffffff" }}>
    <Text style={{ fontFamily: arabic ? fontFamily : name ? "Helvetica-Bold" : "Helvetica", fontSize, lineHeight: 1.4, textAlign: "right", direction: arabic ? "rtl" : "ltr", color: name ? "#087d7b" : "#404040" }}>{text}</Text>
  </View>;
}

export function CertificatePdf2({ data, qrDataUrl, photoDataUrl }: WalletCertificateProps) {
  return <Document title={`Health Certificate PDF2 ${data.certificateNumber ?? ""}`}>
    <Page size={[242.64, 153.12]} wrap={false} style={{ fontFamily, backgroundColor: "#f0f4f4" }}>
      <View style={{ width: 242.64, height: 153.12 }}>
      <Image src={path.join(process.cwd(), "public/certificate/pdf2-front.png")} style={box(0, 0, 1011, 638)}/>
      <View style={{ ...box(20, 134, 205, 205), border: "0.24 solid #85bd48", padding: 8 * scale, alignItems: "center", justifyContent: "center" }}>
        {photoDataUrl ? <Image src={photoDataUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }}/> : <Text style={{ fontSize: 4, direction: "rtl", textAlign: "center" }}>لا توجد صورة مسجلة</Text>}
      </View>
      <View style={{ ...box(20, 359, 205, 205), border: "0.24 solid #85bd48", padding: 6 * scale }}>
        <Image src={qrDataUrl} style={{ width: "100%", height: "100%", objectFit: "contain" }}/>
      </View>
      <Value value={data.fullName || data.fullNameAr} left={250} top={176} width={738} height={46} size={6.4} name/>
      <Value value={data.nationalityAr || data.nationality} left={251} top={285}/>
      <Value value={data.identityNumber} left={638} top={285}/>
      <Value value={data.professionAr || data.profession} left={251} top={399}/>
      <Value value={data.certificateNumber} left={638} top={399}/>
      <Value value={dateText(data.hijriExpiryDate, data.expiryDate)} left={251} top={520}/>
      <Value value={dateText(data.hijriIssueDate, data.issueDate)} left={638} top={520}/>
      </View>
    </Page>
  </Document>;
}
