import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createElement, type ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { CertificatePdf2 } from "../src/lib/certificate-pdf2";
import { AdminCertificatePdf } from "../src/lib/admin-certificate-pdf";
import { readArabicCardArtwork } from "../src/lib/arabic-certificate-card";
import type { CertificatePdfData } from "../src/lib/certificate-pdf";

const { renderToBuffer } = createRequire(import.meta.url)("@react-pdf/renderer") as typeof import("@react-pdf/renderer");
const verificationUrl = "https://example.invalid/verify/pdf2-existing-record-test-token-1234567890";
const qrDataUrl = await QRCode.toDataURL(verificationUrl, { errorCorrectionLevel: "H", margin: 4, width: 960 });
const full: CertificatePdfData = {
  fullName: "SAMPLE CERTIFICATE HOLDER", fullNameAr: "اسم تجريبي", identityNumber: "TEST-1234567890", gender: "OTHER",
  nationality: "Bangladeshi", nationalityAr: "بنجلاديش", profession: "Worker", professionAr: "عامل",
  certificateNumber: "HC-PDF2-123456", issueDate: new Date("2026-11-18T00:00:00Z"), expiryDate: new Date("2027-11-07T00:00:00Z"),
  hijriIssueDate: "١٤٤٨/٠٦/٠٨", hijriExpiryDate: "1449/06/08", organizationName: "Example Company", organizationNameAr: "شركة تجريبية",
  organizationNumber: null, licenseNumber: null, municipality: null, city: null, status: "VALID",
};
const empty = Object.fromEntries(Object.keys(full).map(key => [key, null])) as CertificatePdfData;
const portrait = new PNG({ width: 90, height: 110 });
for (let i = 0; i < portrait.data.length; i += 4) portrait.data.set([48, 117, 155, 255], i);
const photoDataUrl = `data:image/png;base64,${PNG.sync.write(portrait).toString("base64")}`;
const cases = {
  full,
  empty,
  fallback: { ...empty, fullName: "English Only", nationality: "Bangladeshi", profession: "Worker", certificateNumber: "FALLBACK-123", issueDate: full.issueDate, expiryDate: full.expiryDate },
  long: { ...full, fullName: null, fullNameAr: "اسم عربي طويل لاختبار عرض الاسم الكامل داخل حدود الشهادة الصحية", identityNumber: "1234567890".repeat(4), certificateNumber: "HC-".repeat(14), professionAr: "عامل تجهيز وتقديم المواد الغذائية والمشروبات", hijriIssueDate: null, hijriExpiryDate: null },
};
const artwork = await readArabicCardArtwork();
for (const [name, data] of Object.entries(cases)) {
  for (const design of ["original", "pdf2"] as const) {
    const props = { data, qrDataUrl, verificationUrl, photoDataUrl: name === "full" ? photoDataUrl : undefined };
    const document = design === "pdf2" ? createElement(CertificatePdf2, props) : createElement(AdminCertificatePdf, { ...props, locale: "ar", artwork });
    const file = `/tmp/hotel-${design}-${name}.pdf`;
    await writeFile(file, await renderToBuffer(document as unknown as ReactElement<DocumentProps>));
    const info = execFileSync("pdfinfo", [file], { encoding: "utf8" });
    assert.match(info, design === "pdf2" ? /^Pages:\s+2$/m : /^Pages:\s+1$/m);
    assert.match(info, design === "pdf2" ? /242\.64 x 153\.12 pts/ : /595\.28 x 841\.89 pts \(A4\)/);
    const text = execFileSync("pdftotext", [file, "-"], { encoding: "utf8" });
    assert.doesNotMatch(text, /undefined|null|Invalid Date|MD NANTU MIAH|2437827856|480546264962/);
    if (data.certificateNumber) assert(text.includes(data.certificateNumber));
    if (design === "pdf2" && name === "full") {
      assert(text.includes(full.fullName!));
      assert(text.includes("1448/06/08"));
      assert(text.includes("1449/06/08"));
      const backInfo = execFileSync("pdfinfo", ["-f", "2", "-l", "2", file], { encoding: "utf8" });
      assert.match(backInfo, /Page\s+2 size:\s+242\.64 x 153\.12 pts/);
      const directory = await mkdtemp("/tmp/hotel-pdf2-instructions-");
      try {
        execFileSync("pdfimages", ["-f", "2", "-l", "2", "-png", file, `${directory}/image`]);
        const embedded = PNG.sync.read(await readFile(`${directory}/image-000.png`));
        const supplied = PNG.sync.read(await readFile("public/certificate/pdf2-instructions.png"));
        assert.equal(embedded.width, supplied.width);
        assert.equal(embedded.height, supplied.height);
        assert.deepEqual(embedded.data, supplied.data);
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    }
    execFileSync("pdftoppm", ["-singlefile", "-r", design === "pdf2" ? "400" : "120", "-png", file, file.slice(0, -4)]);
    const png = PNG.sync.read(await readFile(file.replace(/pdf$/, "png")));
    const qr = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
    assert.equal(qr?.data, verificationUrl, `${design}/${name}: QR must resolve to this certificate`);
    console.log(`PASS ${design}/${name}: ${design === "pdf2" ? "two pages with instructions" : "one page"}, dimensions, data and QR`);
  }
}
