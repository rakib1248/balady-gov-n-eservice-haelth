import assert from "node:assert/strict";
import { getCertificateDisplayStatus, getCertificateVerificationStatus } from "../src/lib/certificate-status";

const now = new Date("2026-11-24T12:00:00.000Z");
assert.equal(getCertificateDisplayStatus("VALID", new Date("2026-11-25T23:59:59.999Z"), now), "VALID");
assert.equal(getCertificateDisplayStatus("VALID", new Date("2026-11-23T23:59:59.999Z"), now), "EXPIRED");
assert.equal(getCertificateDisplayStatus("VALID", new Date("2026-11-24T23:59:59.999Z"), now), "EXPIRED");
assert.equal(getCertificateVerificationStatus("VALID", new Date("2026-11-25T23:59:59.999Z"), now), "VALID");
assert.equal(getCertificateVerificationStatus("VALID", new Date("2026-11-23T23:59:59.999Z"), now), "EXPIRED");
assert.equal(getCertificateVerificationStatus("EXPIRED", new Date("2026-11-25T23:59:59.999Z"), now), "VALID");
assert.equal(getCertificateVerificationStatus("REVOKED", new Date("2026-11-25T23:59:59.999Z"), now), "REVOKED");
assert.equal(getCertificateVerificationStatus(null, null, now), "INVALID");
assert.equal(getCertificateDisplayStatus("REVOKED", new Date("2027-11-23T23:59:59.999Z"), now), "REVOKED");
console.log("Certificate status smoke checks passed.");
