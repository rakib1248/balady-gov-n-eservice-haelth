/* eslint-disable jsx-a11y/alt-text -- React PDF images are embedded in the document. */
import path from "node:path";
import { Circle, Document, Image, Link, Page, Path, StyleSheet, Svg, Text, View } from "@react-pdf/renderer";
import type { CertificatePdfData } from "./certificate-pdf";

// The physical PDF page is a wallet card. All layout dimensions below are in points.
const mmToPoints = 72 / 25.4;
const cardWidth = 85.6 * mmToPoints;
const cardHeight = 53.98 * mmToPoints;
const teal = "#066f70";
const styles = StyleSheet.create({
  page: { alignItems: "center", justifyContent: "center", fontFamily: "Helvetica", color: "#333d3b" },
  card: { width: cardWidth, height: cardHeight, backgroundColor: "#f2f4f3", position: "relative" },
  banner: { position: "absolute", top: 4.2, left: 0, width: 115, height: 25.2, backgroundColor: "#7fbb43", alignItems: "center", justifyContent: "center" },
  title: { color: "white", fontSize: 10.3 },
  logos: { position: "absolute", right: 0, top: 2.4, width: 78.6, height: 28.9, objectFit: "contain" },
  media: { position: "absolute", left: 4.9, width: 49.4, height: 49.4, justifyContent: "center", alignItems: "center", border: "0.45 solid #b1ce91", padding: 2.4 },
  image: { width: "100%", height: "100%", objectFit: "contain" },
  name: { position: "absolute", right: 7.9, top: 34, width: 171.7, height: 20, alignItems: "flex-end", justifyContent: "center" },
  label: { fontSize: 4.7, textAlign: "right", marginBottom: 1.2 },
  row: { position: "absolute", left: 60.1, right: 4.5, flexDirection: "row", gap: 7.3 },
  field: { flex: 1 },
  valueBox: { height: 11.2, justifyContent: "center", backgroundColor: "#fff", paddingHorizontal: 3 },
  footer: { position: "absolute", left: 5.2, right: 4.5, bottom: 1.5, height: 11.5, borderBottom: "0.35 solid #679e91", borderRight: "0.35 solid #679e91", borderBottomRightRadius: 4.2, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingRight: 3.6 },
  contactGroup: { flexDirection: "row", gap: 1.5, alignItems: "center" },
  contact: { color: teal, fontSize: 3.9, textDecoration: "none" },
  caption: { fontSize: 3.1, color: "#52655c", marginTop: 0.6 },
});

const formatDate = new Intl.DateTimeFormat("en-GB", {day: "2-digit", month: "short", year: "numeric", timeZone: "UTC"});
function digits(value: string) {
  return value.replace(/[٠-٩۰-۹]/g, digit => String(digit.charCodeAt(0) & 15));
}

// Bound long unbroken identifiers as well as multi-word names to their printed box.
function fittedText(value: string, width: number, size: number, lines: number) {
  const longestWord = Math.max(1, ...value.split(/\s+/).map(word => word.length));
  const fontSize = Math.min(size, width / longestWord, width * lines / (value.length + lines));
  return { fontSize, lineHeight: 1.12 };
}
function Field({ label, value }: { label: string; value: string }) {
  return <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.valueBox}><Text style={{ ...fittedText(value, 76.7, 5.5, 2), textAlign: "right" }}>{digits(value)}</Text></View>
  </View>;
}

const iconPaths = {
  phone: "M7 5 L10 8 L9 10 Q10 13 14 15 L16 13 L19 16 Q18 20 14 18 Q6 15 5 8 Z",
  social: "M5 6 H9 L18 18 H14 Z M17 6 L6 18",
  web: "M3 12 H21 M12 3 C6 8 6 16 12 21 C18 16 18 8 12 3 Z",
};
function ContactIcon({kind}: {kind: keyof typeof iconPaths}) {
  return <Svg width={5.8} height={5.8} viewBox="0 0 24 24">
    <Circle cx={12} cy={12} r={10} fill="none" stroke="#8cb96a" strokeWidth={1.4}/>
    <Path d={iconPaths[kind]} fill="none" stroke="#74a555" strokeWidth={1.3}/>
  </Svg>;
}

type Props = {
  data: Pick<CertificatePdfData, "organizationName" | "fullName" | "identityNumber" | "nationality" | "profession" | "certificateNumber" | "issueDate" | "expiryDate" | "status">;
  verificationUrl: string;
  qrDataUrl: string;
  photoDataUrl?: string;
};

export function AdminCertificatePdf({ data, verificationUrl, qrDataUrl, photoDataUrl }: Props) {
  const name = digits(data.fullName.toUpperCase());
  return <Document title={`Health Certificate ${data.certificateNumber}`}>
    <Page size={[cardWidth, cardHeight]} style={styles.page}>
      <View wrap={false} style={styles.card}>
        <Svg width={cardWidth} height={cardHeight} viewBox="0 0 800 504" style={{position: "absolute"}}>
          <Path d="M280 0 Q570 125 800 8 M260 8 Q570 138 800 20 M570 504 Q530 220 800 74 M587 504 Q550 226 800 89" fill="none" stroke="#e9eeeb" strokeWidth={1.5}/>
        </Svg>
        <View style={styles.banner}><Text style={styles.title}>Health Certificate</Text></View>
        <Image src={path.join(process.cwd(), "public/certificate/header-logos.png")} style={styles.logos}/>
        <View style={[styles.media, {top: 31.8}]}>
          {photoDataUrl ? <Image src={photoDataUrl} style={styles.image}/> : <Text style={styles.caption}>No photo on file</Text>}
        </View>
        <View style={[styles.media, {top: 85.8}]}><Image src={qrDataUrl} style={styles.image}/></View>
        <View style={styles.name}>
          <Text style={styles.caption}>Name</Text>
          <Text style={{ ...fittedText(name, 170.5, 7, 2), fontFamily: "Helvetica-Bold", color: teal, textAlign: "right" }}>{name}</Text>
        </View>
        <View style={[styles.row, {top: 60.9}]}><Field label="Nationality" value={data.nationality}/><Field label="ID Number" value={data.identityNumber}/></View>
        <View style={[styles.row, {top: 88.3}]}><Field label="Occupation" value={data.profession}/><Field label="Health Certificate Number" value={data.certificateNumber}/></View>
        <View style={[styles.row, {top: 117.1}]}><Field label="Expiry Date" value={formatDate.format(data.expiryDate)}/><Field label="Issue Date" value={formatDate.format(data.issueDate)}/></View>
        <View style={styles.footer}>
          <View style={styles.contactGroup}>
            <ContactIcon kind="phone"/>
            <View><Text style={styles.contact}>199040</Text><Text style={styles.caption}>Balady Customer Care</Text></View>
          </View>
          <View style={styles.contactGroup}>
            <ContactIcon kind="social"/>
            <Link style={styles.contact} src="https://x.com/balady_cs">@Balady_cs</Link>
          </View>
          <View style={{width: 58}}>
            <Text style={{...fittedText(data.organizationName, 56.7, 3.9, 2), color: teal}}>{data.organizationName}</Text>
            <Text style={styles.caption}>Private company certificate · {data.status}</Text>
          </View>
          <Link style={styles.contact} src={verificationUrl}>Scan to Verify</Link>
          <View style={styles.contactGroup}>
            <ContactIcon kind="web"/>
            <Link style={styles.contact} src="https://balady.gov.sa">www.balady.gov.sa</Link>
          </View>
        </View>
      </View>
    </Page>
  </Document>;
}
