import { writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { createElement } from "react";
import { Font, renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { CertificatePdf } from "../src/lib/certificate-pdf";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { createVerificationToken, decryptVerificationToken } from "../src/lib/verification-token";

async function main() {
process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 0x5a).toString("base64");
const generatedToken = createVerificationToken();
assert.equal(generatedToken.hash, createHash("sha256").update(generatedToken.token).digest("hex"));
assert.equal(decryptVerificationToken(generatedToken.ciphertext), generatedToken.token);
assert.equal(generatedToken.ciphertext.includes(generatedToken.token), false);
Font.register({ family: "Noto Arabic", src: path.join(process.cwd(), "public/fonts/NotoSansArabic.ttf") });
const url = "https://example.invalid/verify/smoke-token";
const qrDataUrl = await QRCode.toDataURL(url);
const pdf = await renderToBuffer(createElement(CertificatePdf, {
  data: {
    fullName: "Sample Person", fullNameAr: "اسم تجريبي", identityNumber: "TEST-0000", gender: "OTHER",
    nationality: "Test", nationalityAr: "تجريبية", profession: "Food Handler", professionAr: "عامل أغذية",
    certificateNumber: "HC-SMOKE-0001", issueDate: new Date("2026-01-01T00:00:00Z"), expiryDate: new Date("2027-01-01T23:59:59Z"),
    hijriIssueDate: null, hijriExpiryDate: null, organizationName: "Example Company", organizationNameAr: "شركة تجريبية",
    organizationNumber: "ORG-TEST", licenseNumber: "LIC-TEST", municipality: "Test Municipality", city: "Test City",
    programType: "Food Safety", programExpiryDate: new Date("2027-01-01T23:59:59Z"), status: "VALID",
  },
  verificationUrl: url,
  qrDataUrl,
}) as unknown as ReactElement<DocumentProps>);
const pdfPath = "/tmp/rifd-private-certificate-smoke.pdf";
await writeFile(pdfPath, pdf);
execFileSync("pdftoppm", ["-f", "1", "-singlefile", "-png", "-r", "120", pdfPath, "/tmp/rifd-private-certificate-smoke"]);
const png = PNG.sync.read(await (await import("node:fs/promises")).readFile("/tmp/rifd-private-certificate-smoke.png"));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
if (decoded?.data !== url) throw new Error("The PDF QR code did not decode to the expected verification URL.");
console.log("Created one-page A4 PDF and decoded its printed QR URL.");
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
