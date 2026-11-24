import { z } from "zod";

const dateField = z.iso.date();
export const certificateInput = z.object({
  fullName: z.string().trim().min(2).max(160),
  fullNameAr: z.string().trim().min(2).max(160),
  identityNumber: z.string().trim().min(4).max(40),
  gender: z.enum(["FEMALE", "MALE", "OTHER"]),
  nationality: z.string().trim().min(2).max(80),
  nationalityAr: z.string().trim().min(2).max(80),
  profession: z.string().trim().min(2).max(100),
  professionAr: z.string().trim().min(2).max(100),
  photoKey: z.string().trim().max(300).optional().default(""),
  certificateNumber: z.string().trim().min(4).max(40).regex(/^[A-Z0-9-]+$/),
  issueDate: dateField,
  expiryDate: dateField,
  hijriIssueDate: z.string().trim().max(30).optional().default(""),
  hijriExpiryDate: z.string().trim().max(30).optional().default(""),
  organizationName: z.string().trim().min(2).max(160),
  organizationNameAr: z.string().trim().min(2).max(160),
  organizationNumber: z.string().trim().min(2).max(60),
  licenseNumber: z.string().trim().min(2).max(60),
  municipality: z.string().trim().min(2).max(100),
  city: z.string().trim().min(2).max(100),
  programType: z.string().trim().min(2).max(100),
  programExpiryDate: dateField,
}).refine((data) => data.expiryDate > data.issueDate, { path: ["expiryDate"], message: "تاريخ الانتهاء يجب أن يكون بعد تاريخ الإصدار" });

export type CertificateInput = z.infer<typeof certificateInput>;
