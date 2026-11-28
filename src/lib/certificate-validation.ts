import { z } from "zod";

const optional = <T extends z.ZodType>(schema: T) => z.preprocess(value => value == null || (typeof value === "string" && !value.trim()) ? null : value, schema.nullable()).optional().transform(value => value ?? null);
const dateField = optional(z.iso.date());
export const certificateInput = z.object({
  fullName: optional(z.string().trim().min(2).max(160)),
  fullNameAr: optional(z.string().trim().min(2).max(160)),
  identityNumber: optional(z.string().trim().min(4).max(40)),
  gender: optional(z.enum(["FEMALE", "MALE", "OTHER"])),
  nationality: optional(z.string().trim().min(2).max(80)),
  nationalityAr: optional(z.string().trim().min(2).max(80)),
  profession: optional(z.string().trim().min(2).max(100)),
  professionAr: optional(z.string().trim().min(2).max(100)),
  photoKey: optional(z.string().trim().max(300)),
  certificateNumber: optional(z.string().trim().min(4).max(40).regex(/^[A-Z0-9-]+$/)),
  issueDate: dateField,
  expiryDate: dateField,
  hijriIssueDate: optional(z.string().trim().max(30)),
  hijriExpiryDate: optional(z.string().trim().max(30)),
  organizationName: optional(z.string().trim().min(2).max(160)),
  organizationNameAr: optional(z.string().trim().min(2).max(160)),
  organizationNumber: optional(z.string().trim().min(2).max(60)),
  licenseNumber: optional(z.string().trim().min(2).max(60)),
  municipality: optional(z.string().trim().min(2).max(100)),
  city: optional(z.string().trim().min(2).max(100)),
  programType: optional(z.string().trim().min(2).max(100)),
  programExpiryDate: dateField,
}).refine((data) => !data.expiryDate || !data.issueDate || data.expiryDate > data.issueDate, { path: ["expiryDate"], message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ الإصدار" });

export type CertificateInput = z.infer<typeof certificateInput>;
