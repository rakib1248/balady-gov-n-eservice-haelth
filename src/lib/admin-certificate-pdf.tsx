/* eslint-disable jsx-a11y/alt-text -- React PDF images are embedded in the document. */
import path from "node:path";
import { Circle, Document, Font, Image, Link, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import { ArabicCertificatePage, type WalletCertificateProps } from "./arabic-certificate-card";

// The physical PDF page is a wallet card. All layout dimensions below are in points.
const mmToPoints = 72 / 25.4;
const cardWidth = 85.6 * mmToPoints;
const cardHeight = 53.98 * mmToPoints;
const arabicFont = "Wallet Noto Arabic";
Font.register({ family: arabicFont, src: path.join(process.cwd(), "public/fonts/NotoSansArabic.ttf") });
const teal = "#066f70";
const styles = StyleSheet.create({
  page: { alignItems: "center", justifyContent: "center", fontFamily: "Helvetica", color: "#333d3b" },
  card: { width: cardWidth, height: cardHeight, backgroundColor: "#f6f7f6", borderRadius: 7, overflow: "hidden", position: "relative" },
  banner: { position: "absolute", top: 12, left: 0, width: 116, height: 22.4, backgroundColor: "#7fbb43", alignItems: "center", justifyContent: "center" },
  title: { color: "white", fontSize: 9.6 },
  logos: { position: "absolute", right: 11.9, top: 9.5, width: 69, height: 25.4, objectFit: "contain" },
  media: { position: "absolute", left: 18, width: 44.5, height: 44.5, justifyContent: "center", alignItems: "center", border: "0.4 solid #bbd0a5", backgroundColor: "#f9faf8", padding: 2.1 },
  image: { width: "100%", height: "100%", objectFit: "contain" },
  name: { position: "absolute", right: 17, top: 41.3, width: 157, height: 20, alignItems: "flex-end", justifyContent: "center" },
  label: { fontSize: 4.25, textAlign: "right", marginBottom: 0.9 },
  row: { position: "absolute", left: 68, right: 14.1, flexDirection: "row", gap: 6.5 },
  field: { flex: 1 },
  valueBox: { height: 9.5, justifyContent: "center", backgroundColor: "#fff", paddingHorizontal: 3 },
  footer: { position: "absolute", left: 18, right: 13, bottom: 8.5, height: 9.5, borderBottom: "0.35 solid #679e91", borderRight: "0.35 solid #679e91", borderBottomRightRadius: 4.2, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 3.6 },
  contactGroup: { flexDirection: "row", gap: 1.5, alignItems: "center" },
  contact: { color: teal, fontSize: 3.8, textDecoration: "none" },
  caption: { fontSize: 3.1, color: "#52655c", marginTop: 0.6 },
});

const englishDateOptions = {day: "2-digit", month: "short", year: "numeric", timeZone: "UTC", calendar: "gregory"} as const;
const englishDate = new Intl.DateTimeFormat("en-GB", englishDateOptions);
function digits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) & 15));
}

// Bound long unbroken identifiers as well as multi-word names to their printed box.
function fittedText(input: string | null, width: number, size: number, lines: number) {
  const value = input ?? "";
  const direction = /\p{Script=Arabic}/u.test(value) ? "rtl" as const : "ltr" as const;
  const longestWord = Math.max(1, ...value.split(/\s+/).map(word => word.length));
  const fontSize = Math.min(size, width / longestWord, width * lines / (value.length + lines));
  return { fontSize, lineHeight: 1.12, direction };
}
function Field({ label, value }: { label: string; value: string | null }) {
  return <View style={styles.field}>
    <Text style={[styles.label, {lineHeight: /\p{Script=Arabic}/u.test(label) ? 1.65 : 1.2}]}>{label}</Text>
    <View style={styles.valueBox}><Text style={{ ...fittedText(value, 71, 4.8, 2), textAlign: "right" }}>{digits(value ?? "")}</Text></View>
  </View>;
}

const iconPaths = {
  phone: "M7 5 L10 8 L9 10 Q10 13 14 15 L16 13 L19 16 Q18 20 14 18 Q6 15 5 8 Z",
  social: "M5 6 H9 L18 18 H14 Z M17 6 L6 18",
  video: "M5 8 Q5 7 7 7 H17 Q19 7 19 9 V15 Q19 17 17 17 H7 Q5 17 5 15 Z M10 9.5 L15 12 L10 14.5 Z",
  web: "M3 12 H21 M12 3 C6 8 6 16 12 21 C18 16 18 8 12 3 Z",
};
function ContactIcon({kind}: {kind: keyof typeof iconPaths}) {
  return <Svg width={5.8} height={5.8} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="none" stroke="#8cb96a" strokeWidth={1.4}/>
    <Path d={iconPaths[kind]} fill="none" stroke="#74a555" strokeWidth={1.3}/>
  </Svg>;
}

function EnglishCertificatePage({ data, verificationUrl, qrDataUrl, photoDataUrl }: WalletCertificateProps) {
  const name = digits((data.fullName ?? "").toUpperCase());
  return <Page size={[cardWidth, cardHeight]} style={[styles.page, {fontFamily: "Helvetica"}]}>
      <View wrap={false} style={styles.card}>
        <Svg width={cardWidth} height={cardHeight} viewBox="0 0 800 504" style={{position: "absolute"}}>
          <Path d="M280 0 Q570 125 800 8 M260 8 Q570 138 800 20 M570 504 Q530 220 800 74 M587 504 Q550 226 800 89" fill="none" stroke="#eff2ef" strokeWidth={1.5}/>
        </Svg>
        <View style={styles.banner}><Text style={styles.title}>Health Certificate</Text></View>
        <Image src={path.join(process.cwd(), "public/certificate/header-logos.png")} style={styles.logos}/>
        <View style={[styles.media, {top: 37}]}>
          {photoDataUrl ? <Image src={photoDataUrl} style={[styles.image, {backgroundColor: "#fff"}]}/> : <Text style={styles.caption}>No photo on file</Text>}
        </View>
        <View style={[styles.media, {top: 85.8}]}><Image src={qrDataUrl} style={styles.image}/></View>
        <View style={styles.name}>
          <Text style={{ ...fittedText(name, 157, 6.2, 2), fontFamily: /\p{Script=Arabic}/u.test(name) ? arabicFont : "Helvetica-Bold", color: teal, textAlign: "right" }}>{name}</Text>
        </View>
        <View style={[styles.row, {top: 62.8}]}><Field label="Nationality" value={data.nationality}/><Field label="ID Number" value={data.identityNumber}/></View>
        <View style={[styles.row, {top: 87.1}]}><Field label="Occupation" value={data.profession}/><Field label="Health Certificate Number" value={data.certificateNumber}/></View>
        <View style={[styles.row, {top: 112.4}]}><Field label="Expiry Date" value={data.expiryDate ? englishDate.format(data.expiryDate) : ""}/><Field label="Issue Date" value={data.issueDate ? englishDate.format(data.issueDate) : ""}/></View>
        <View style={styles.footer}>
          <View style={styles.contactGroup}>
            <ContactIcon kind="phone"/>
            <Text style={{fontFamily: "Helvetica-Bold", color: "#525c58", fontSize: 5.7}}>199040</Text>
            <Text style={{fontSize: 2.7, color: "#53655e"}}>Customer Care</Text>
          </View>
          <View style={styles.contactGroup}>
            <ContactIcon kind="social"/>
            <Link style={styles.contact} src="https://x.com/balady_cs">Balady_cs</Link>
          </View>
          <View style={styles.contactGroup}>
            <ContactIcon kind="video"/>
            <Text style={styles.contact}>saudimomra</Text>
          </View>
          <View style={styles.contactGroup}>
            <ContactIcon kind="web"/>
            <Link style={styles.contact} src="https://balady.gov.sa">www.balady.gov.sa</Link>
          </View>
        </View>
        <View style={{position: "absolute", left: 18, right: 14, bottom: 2.4, flexDirection: "row", justifyContent: "space-between", alignItems: "center"}}>
          <Text style={{...fittedText(data.organizationName, 63, 3, 1), color: teal}}>{data.organizationName}</Text>
          <Text style={{fontSize: 3, color: "#52655c"}}>{`Private company certificate · ${data.status ?? ""}`}</Text>
          <Link style={{fontSize: 3, color: teal}} src={verificationUrl}>Scan to Verify</Link>
        </View>
      </View>
    </Page>;
}

export function AdminCertificatePdf({ locale, artwork, ...props }: WalletCertificateProps & (
  | { locale: "en"; artwork?: undefined }
  | { locale?: "ar"; artwork: { front: Buffer; instructions: Buffer } }
)) {
  return <Document title={`Health Certificate ${props.data.certificateNumber ?? ""}`}>
    {locale !== "en" && <ArabicCertificatePage {...props} artwork={artwork}/>}
    {locale !== "ar" && <EnglishCertificatePage {...props}/>}
  </Document>;
}
