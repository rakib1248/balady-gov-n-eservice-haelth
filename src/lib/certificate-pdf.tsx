/* eslint-disable jsx-a11y/alt-text -- React PDF Image primitives do not render HTML images. */
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import path from "node:path";

Font.register({ family: "Noto Arabic", src: path.join(process.cwd(), "public/fonts/NotoSansArabic.ttf") });
const styles = StyleSheet.create({
  page: { padding: 22, fontFamily: "Noto Arabic", color: "#19352a", fontSize: 9, backgroundColor: "#ffffff" },
  frame: { border: "1 solid #cddfd3", padding: 10 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottom: "1 solid #e1ebe5", paddingBottom: 9, marginBottom: 9 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 }, logo: { width: 31, height: 31, borderRadius: 8, backgroundColor: "#16805b", alignItems: "center", justifyContent: "center" }, logoText: { color: "#ffffff", fontSize: 14, fontWeight: 700 }, brandName: { fontSize: 13, fontWeight: 700, color: "#176748" }, brandSub: { fontSize: 7, color: "#75877e" }, privateTag: { border: "1 solid #d7e6dc", color: "#276d4e", padding: "5 8", borderRadius: 4, fontSize: 7 },
  title: { textAlign: "center", fontSize: 19, fontWeight: 700, marginTop: 5, marginBottom: 2 }, subtitle: { textAlign: "center", color: "#829189", fontSize: 9, marginBottom: 10 }, number: { alignSelf: "center", backgroundColor: "#eff7f2", color: "#196b4a", padding: "5 12", borderRadius: 20, fontSize: 10, marginBottom: 10 },
  person: { flexDirection: "row", alignItems: "center", border: "1 solid #e7eee9", borderRadius: 8, padding: 8, marginBottom: 8, gap: 10 }, photo: { width: 60, height: 68, objectFit: "cover", borderRadius: 5 }, photoFallback: { width: 60, height: 68, backgroundColor: "#edf4ef", borderRadius: 5, alignItems: "center", justifyContent: "center", color: "#52836a", fontSize: 10 }, personInfo: { flex: 1 }, name: { textAlign: "right", fontSize: 14, fontWeight: 700, marginBottom: 2 }, enName: { textAlign: "left", fontSize: 9, color: "#78877f", marginBottom: 7 }, identity: { fontSize: 8, color: "#46584e", textAlign: "right" },
  section: { fontSize: 8, fontWeight: 700, color: "#277454", textAlign: "right", marginTop: 4, marginBottom: 5 }, grid: { flexDirection: "row", flexWrap: "wrap", borderTop: "1 solid #e8efea", borderLeft: "1 solid #e8efea", marginBottom: 6 }, cell: { width: "50%", minHeight: 35, padding: 6, borderRight: "1 solid #e8efea", borderBottom: "1 solid #e8efea" }, label: { fontSize: 7, color: "#87958d", textAlign: "right", marginBottom: 2 }, value: { fontSize: 9, textAlign: "right", fontWeight: 600 }, english: { fontSize: 7, color: "#53675c", textAlign: "left", marginTop: 2 },
  bottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 6, paddingTop: 7, borderTop: "1 solid #e3ebe5" }, qr: { width: 68, height: 68 }, verify: { flex: 1, paddingHorizontal: 10, textAlign: "right" }, verifyHead: { fontSize: 9, fontWeight: 700, marginBottom: 4 }, verifyText: { color: "#79877f", fontSize: 7, lineHeight: 1.5 }, verifyUrl: { fontSize: 6, color: "#23724f", marginTop: 4 }, disclaimer: { marginTop: 8, borderRadius: 5, padding: 6, backgroundColor: "#f4f8f5", color: "#64786d", textAlign: "center", fontSize: 7 },
});

export type CertificatePdfData = {
  fullName: string; fullNameAr: string; identityNumber: string; gender: string; nationality: string; nationalityAr: string;
  profession: string; professionAr: string; certificateNumber: string; issueDate: Date; expiryDate: Date; hijriIssueDate: string | null;
  hijriExpiryDate: string | null; organizationName: string; organizationNameAr: string; organizationNumber: string;
  licenseNumber: string; municipality: string; city: string; programType: string; programExpiryDate: Date; status: string;
};
const date = (value: Date) => value.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" });

export function CertificatePdf({ data, verificationUrl, qrDataUrl, photoDataUrl }: { data: CertificatePdfData; verificationUrl: string; qrDataUrl: string; photoDataUrl?: string }) {
  const detail = (label: string, arabic: string, english?: string) => <View style={styles.cell} key={label}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{arabic}</Text>{english&&<Text style={styles.english}>{english}</Text>}</View>;
  return <Document title={`Private certificate ${data.certificateNumber}`} author="Rifd"><Page size="A4" style={styles.page}><View style={styles.frame}>
    <View style={styles.header}><View style={styles.brand}><View style={styles.logo}><Text style={styles.logoText}>ر</Text></View><View><Text style={styles.brandName}>رِفد</Text><Text style={styles.brandSub}>RIFD · HEALTH CERTIFICATES</Text></View></View><Text style={styles.privateTag}>PRIVATE COMPANY DOCUMENT · NOT GOVERNMENT ISSUED</Text></View>
    <Text style={styles.title}>شهادة صحية</Text><Text style={styles.subtitle}>HEALTH CERTIFICATE</Text><Text style={styles.number}>{data.certificateNumber} · {data.status}</Text>
    <View style={styles.person}>{photoDataUrl?<Image src={photoDataUrl} style={styles.photo}/>:<View style={styles.photoFallback}><Text>صورة شخصية</Text></View>}<View style={styles.personInfo}><Text style={styles.name}>{data.fullNameAr}</Text><Text style={styles.enName}>{data.fullName}</Text><Text style={styles.identity}>رقم الهوية: {data.identityNumber} · {data.gender === "FEMALE" ? "أنثى" : data.gender === "MALE" ? "ذكر" : "أخرى"}</Text></View></View>
    <Text style={styles.section}>بيانات المستفيد · BENEFICIARY</Text><View style={styles.grid}>{detail("الجنسية · NATIONALITY", data.nationalityAr, data.nationality)}{detail("المهنة · PROFESSION", data.professionAr, data.profession)}{detail("تاريخ الإصدار · ISSUE DATE", date(data.issueDate), data.hijriIssueDate ?? undefined)}{detail("تاريخ الانتهاء · EXPIRY DATE", date(data.expiryDate), data.hijriExpiryDate ?? undefined)}</View>
    <Text style={styles.section}>بيانات المنشأة · ORGANIZATION</Text><View style={styles.grid}>{detail("المنشأة · ORGANIZATION", data.organizationNameAr, data.organizationName)}{detail("رقم المنشأة · ORGANIZATION NO.", data.organizationNumber)}{detail("رقم الرخصة · LICENSE NO.", data.licenseNumber)}{detail("البلدية والمدينة · MUNICIPALITY / CITY", `${data.municipality} · ${data.city}`)}</View>
    <Text style={styles.section}>البرنامج التثقيفي · TRAINING</Text><View style={styles.grid}>{detail("نوع البرنامج · PROGRAM", data.programType)}{detail("انتهاء البرنامج · PROGRAM EXPIRY", date(data.programExpiryDate))}</View>
    <View style={styles.bottom}><Image src={qrDataUrl} style={styles.qr}/><View style={styles.verify}><Text style={styles.verifyHead}>التحقق من الشهادة · VERIFY</Text><Text style={styles.verifyText}>امسح رمز QR للتحقق من حالة الشهادة عبر بوابة رِفد. تعرض صفحة التحقق معلومات عامة محدودة.</Text><Text style={styles.verifyUrl}>{verificationUrl}</Text></View></View>
    <Text style={styles.disclaimer}>شهادة شركة خاصة صادرة عن رِفد. ليست مستنداً حكومياً ولا تمثل أي جهة حكومية. · PRIVATE COMPANY CERTIFICATE — NOT A GOVERNMENT DOCUMENT.</Text>
  </View></Page></Document>;
}
