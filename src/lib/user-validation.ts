import { z } from "zod";

export const managedUserRole = z.enum(["ADMIN", "STAFF"]);
export const userRoleFilter = z.enum(["OWNER", "ADMIN", "STAFF", "EDITOR", "VIEWER"]);

const userName = z.string().trim().min(1).max(100);
const userEmail = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const userPassword = z.string().min(12).max(128).refine((value) => Buffer.byteLength(value, "utf8") <= 72, { message: "Password exceeds the supported bcrypt input length." });

export const createUserInput = z.object({
  name: userName,
  email: userEmail,
  password: userPassword,
  role: managedUserRole,
}).strict();

export const updateUserInput = z.object({
  name: userName.optional(),
  email: userEmail.optional(),
  password: userPassword.optional(),
  role: managedUserRole.optional(),
  isActive: z.boolean().optional(),
}).strict().refine((value) => Object.keys(value).length > 0, { message: "At least one field is required." });
