import assert from "node:assert/strict";
import { certificateInput } from "../src/lib/certificate-validation";

const sample = {
  fullName: "Sample Person", fullNameAr: "اسم تجريبي", identityNumber: "ID-TEST-1", gender: "OTHER",
  nationality: "Sample", nationalityAr: "تجريبية", profession: "Food Handler", professionAr: "عامل أغذية",
  certificateNumber: "HC-2026-00001", issueDate: "2026-01-01", expiryDate: "2027-01-01",
  organizationName: "Example Organization", organizationNameAr: "منشأة تجريبية", organizationNumber: "ORG-TEST",
  licenseNumber: "LIC-TEST", municipality: "Test Municipality", city: "Test City", programType: "Food Safety", programExpiryDate: "2027-01-01",
};
assert.equal(certificateInput.safeParse(sample).success, true);
assert.equal(certificateInput.safeParse({ ...sample, certificateNumber: "invalid number" }).success, false);
assert.equal(certificateInput.safeParse({ ...sample, expiryDate: "2025-01-01" }).success, false);
assert.equal(certificateInput.safeParse({ ...sample, issueDate: "2026-02-30" }).success, false);
console.log("Certificate input validation smoke checks passed.");

for (const blank of [undefined, null, "", "   "]) {
  const empty = Object.fromEntries(Object.keys(sample).map(key => [key, blank]));
  assert.equal(certificateInput.safeParse(empty).success, true);
}
assert.equal(certificateInput.safeParse({}).success, true);
assert.equal(certificateInput.safeParse({ fullName: "Partial certificate" }).success, true);
