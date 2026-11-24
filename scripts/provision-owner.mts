import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import { hash } from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../src/generated/prisma/client";

function ask(question: string) {
  const reader = createInterface({ input: stdin, output: stdout });
  return new Promise<string>((resolve) => reader.question(question, (answer) => { reader.close(); resolve(answer.trim()); }));
}

function secret(question: string) {
  if (!stdin.isTTY || !stdin.setRawMode) throw new Error("Run this command in an interactive terminal so the password stays hidden.");
  stdout.write(question);
  stdin.setRawMode(true); stdin.setEncoding("utf8"); stdin.resume();
  return new Promise<string>((resolve, reject) => {
    let value = "";
    const onData = (chunk: string) => {
      for (const char of chunk) {
        if (char === "\u0003") { cleanup(); reject(new Error("Cancelled.")); return; }
        if (char === "\r" || char === "\n") { cleanup(); stdout.write("\n"); resolve(value); return; }
        if (char === "\u007f" || char === "\b") { value = value.slice(0, -1); continue; }
        value += char;
      }
    };
    const cleanup = () => { stdin.off("data", onData); stdin.setRawMode(false); stdin.pause(); };
    stdin.on("data", onData);
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("Set DATABASE_URL in the process environment before provisioning.");
  const name = await ask("Owner name: ");
  const email = (await ask("Owner email: ")).toLowerCase();
  const organizationName = await ask("Organization name (English): ");
  const organizationNameAr = await ask("Organization name (Arabic): ");
  const organizationNumber = await ask("Organization number: ");
  const password = await secret("Owner password (12+ characters): ");
  const confirmation = await secret("Confirm password: ");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !organizationName || !organizationNameAr || !organizationNumber) throw new Error("Enter valid owner and organization details.");
  if (password.length < 12 || password !== confirmation) throw new Error("Passwords must match and contain at least 12 characters.");
  const adapter = new PrismaNeon({ connectionString: databaseUrl });
  const db = new PrismaClient({ adapter });
  try {
    if (await db.user.findUnique({ where: { email } })) throw new Error("This email already has an account.");
    const passwordHash = await hash(password, 12);
    await db.$transaction(async (tx) => {
      const organization = await tx.organization.create({ data: { name: organizationName, nameAr: organizationNameAr, number: organizationNumber, settings: { create: {} } } });
      await tx.user.create({ data: { name, email, passwordHash, role: "OWNER", organizationId: organization.id } });
    });
    stdout.write("Owner and organization created. The password was not displayed.\n");
  } finally { await db.$disconnect(); }
}

main().catch((error: unknown) => { stdout.write(`${error instanceof Error ? error.message : "Provisioning failed."}\n`); process.exitCode = 1; });
