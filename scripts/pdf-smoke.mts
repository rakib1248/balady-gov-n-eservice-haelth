import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { createElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { readArabicCardArtwork } from "../src/lib/arabic-certificate-card";
import { CertificatePdf } from "../src/lib/certificate-pdf";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { createVerificationToken, decryptVerificationToken } from "../src/lib/verification-token";

// Use the same renderer instance as the TSX certificate modules and their font registry.
const { renderToBuffer } = createRequire(import.meta.url)("@react-pdf/renderer") as typeof import("@react-pdf/renderer");

async function main() {
process.env.TOKEN_ENCRYPTION_KEY = Buffer.alloc(32, 0x5a).toString("base64");
const generatedToken = createVerificationToken();
assert.equal(generatedToken.hash, createHash("sha256").update(generatedToken.token).digest("hex"));
assert.equal(decryptVerificationToken(generatedToken.ciphertext), generatedToken.token);
assert.equal(generatedToken.ciphertext.includes(generatedToken.token), false);
const url = "https://example.invalid/verify/smoke-token";
const qrDataUrl = await QRCode.toDataURL(url);
const certificate = {
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
};
const pdf = await renderToBuffer(createElement(CertificatePdf, certificate) as unknown as ReactElement<DocumentProps>);
const pdfPath = "/tmp/rifd-private-certificate-smoke.pdf";
await writeFile(pdfPath, pdf);
const pdfInfo = execFileSync("pdfinfo", [pdfPath], { encoding: "utf8" });
if (!/^Pages:\s+1\s*$/m.test(pdfInfo) || !/^Page size:\s+595\.28 x 841\.89 pts \(A4\)\s*$/m.test(pdfInfo)) {
  throw new Error("The generated certificate PDF must be exactly one A4 page.");
}
const text = execFileSync("pdftotext", [pdfPath, "-"], { encoding: "utf8" });
if (!text.includes("Scan to Verify")) throw new Error("The PDF is missing the QR scan instruction.");
execFileSync("pdftoppm", ["-f", "1", "-singlefile", "-png", "-r", "120", pdfPath, "/tmp/rifd-private-certificate-smoke"]);
const png = PNG.sync.read(await readFile("/tmp/rifd-private-certificate-smoke.png"));
const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
if (decoded?.data !== url) throw new Error("The PDF QR code did not decode to the expected verification URL.");
const artwork = await readArabicCardArtwork();
const instructions = artwork.instructions;
const arabic = await renderToBuffer(createElement(CertificatePdf, { ...certificate, artwork }) as unknown as ReactElement<DocumentProps>);
const arabicPath = "/tmp/rifd-arabic-certificate-smoke.pdf";
await writeFile(arabicPath, arabic);
const pages = execFileSync("pdfinfo", ["-f", "1", "-l", "1", arabicPath], { encoding: "utf8" });
assert.match(pages, /^Pages:\s+1$/m);
for (const page of [1]) assert(pages.includes(`Page    ${page} size:  595.28 x 841.89 pts (A4)`));
// Inspect the instructions image embedded on the same A4 page.
const extractDir = await mkdtemp("/tmp/rifd-arabic-instructions-");
try {
  const backPrefix = `${extractDir}/back`;
  execFileSync("pdfimages", ["-f", "1", "-l", "1", "-png", arabicPath, backPrefix]);
  const embedded = PNG.sync.read(await readFile(`${backPrefix}-003.png`));
  const expected = PNG.sync.read(instructions);
  assert.equal(embedded.width, expected.width);
  assert.equal(embedded.height, expected.height);
  assert.deepEqual(embedded.data, expected.data);
} finally {
  await rm(extractDir, { recursive: true, force: true });
}
console.log("Verified the one-page PDF and QR, and single Arabic A4 page including the instructions artwork.");
}
main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
