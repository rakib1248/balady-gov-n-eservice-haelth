import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { createHmac } from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";

const credentialsSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 },
  pages: { signIn: "/login" },
  providers: [CredentialsProvider({
    name: "Company account",
    credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" } },
    async authorize(raw) {
      const parsed = credentialsSchema.safeParse(raw);
      if (!parsed.success) return null;
      if (!process.env.NEXTAUTH_SECRET) return null;
      const email = parsed.data.email.toLowerCase();
      const limitKey = `login:${createHmac("sha256", process.env.NEXTAUTH_SECRET).update(email).digest("hex")}`;
      const window = new Date(Math.floor(Date.now() / 60_000) * 60_000);
      const attempts = await db.$queryRaw<Array<{ hits: number }>>`INSERT INTO "PublicRateLimit" ("key", "window", "hits") VALUES (${limitKey}, ${window}, 1) ON CONFLICT ("key") DO UPDATE SET "hits" = CASE WHEN "PublicRateLimit"."window" = EXCLUDED."window" THEN "PublicRateLimit"."hits" + 1 ELSE 1 END, "window" = EXCLUDED."window" RETURNING "hits"`;
      if ((attempts[0]?.hits ?? 0) > 10) return null;
      const user = await db.user.findUnique({ where: { email }, select: { id: true, name: true, email: true, passwordHash: true, role: true, organizationId: true, isActive: true } });
      if (!user || !user.isActive || !(await compare(parsed.data.password, user.passwordHash))) return null;
      return { id: user.id, name: user.name, email: user.email, role: user.role, organizationId: user.organizationId };
    },
  })],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as typeof user & { role?: string }).role;
        token.organizationId = (user as typeof user & { organizationId?: string }).organizationId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.role = String(token.role ?? "VIEWER");
        session.user.organizationId = String(token.organizationId ?? "");
      }
      return session;
    },
  },
};
