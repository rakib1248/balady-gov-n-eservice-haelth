import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function keyBytes() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY;
  if (!raw) throw new Error("TOKEN_ENCRYPTION_KEY is not configured");
  const key = Buffer.from(raw, "base64");
  if (key.byteLength !== 32) throw new Error("TOKEN_ENCRYPTION_KEY must be a base64 encoded 32 byte key");
  return key;
}

export function createVerificationToken() {
  const token = randomBytes(32).toString("base64url");
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const ciphertext = Buffer.concat([cipher.update(token, "utf8"), cipher.final()]);
  return {
    token,
    hash: createHash("sha256").update(token).digest("hex"),
    ciphertext: `v1.${iv.toString("base64url")}.${cipher.getAuthTag().toString("base64url")}.${ciphertext.toString("base64url")}`,
  };
}

export function decryptVerificationToken(value: string) {
  const [version, ivValue, tagValue, ciphertextValue] = value.split(".");
  if (version !== "v1" || !ivValue || !tagValue || !ciphertextValue) throw new Error("Invalid encrypted verification token");
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(), Buffer.from(ivValue, "base64url"));
  decipher.setAuthTag(Buffer.from(tagValue, "base64url"));
  return Buffer.concat([decipher.update(Buffer.from(ciphertextValue, "base64url")), decipher.final()]).toString("utf8");
}
