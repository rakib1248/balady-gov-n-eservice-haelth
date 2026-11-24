# Rifd Health Certificate Manager

Private bilingual certificate management software. It uses independent Rifd branding and clearly identifies certificates as private company documents, not government documents. The supplied reference could be fetched and used to understand Arabic field order and certificate workflow; its identity, logos, seals, and visual assets are not used.

## Delivery plan

1. **Foundation:** Next.js App Router and TypeScript, Arabic RTL shell, credential authentication, organization scoped Prisma schema, Neon adapter, migration, and Netlify configuration.
2. **Certificate operations:** validated create, edit, renew, revoke, list/search, pagination, version snapshots, and audit events.
3. **Public verification:** hashed random tokens, rate limited verification, safe public response, and verification audit trail.
4. **Documents and files:** branded bilingual PDF preview/download, QR code, and validated Cloudflare R2 uploads.
5. **Remaining release work:** organization/team administration, database-backed API acceptance coverage, and live Neon/R2/Netlify release checks.

## Local setup

Use Node 22 and npm. Copy `.env.example` to `.env.local` for Next.js and `.env` for Prisma CLI commands, set a Neon pooled PostgreSQL connection string for `DATABASE_URL`, a direct connection string for `DIRECT_DATABASE_URL`, and random `NEXTAUTH_SECRET` and `TOKEN_ENCRYPTION_KEY` values, then run:

```sh
npm install
npm run db:generate
npm run db:migrate
npm run db:provision-owner
npm run dev
```

Run the provisioning command in a private interactive terminal after migrations; it creates the first organization and OWNER account and does not echo the password.

The lockfile pins a patched Auth.js core package while using the stable NextAuth v4 credentials API; `.npmrc` preserves the optional peer resolution used by this setup.

Generate `TOKEN_ENCRYPTION_KEY` with `openssl rand -base64 32`. Run `npm run pdf:smoke` to render a synthetic A4 certificate and decode its QR from the rendered page.

Production migrations are not run by the Netlify build. Review `npm run db:migrate` output and apply it as a separately approved release step; do not run `db:dev` against production. The initial schema includes organization, user, certificate, version, audit, verification, rate-limit, and organization settings tables. Create the first OWNER user through a secure provisioning process before enabling sign-in; no default account is created.

## Deployment

Configure `DATABASE_URL`, `DIRECT_DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `TOKEN_ENCRYPTION_KEY`, and `APP_BASE_URL` in the hosting environment. Generate a 32-byte encryption key and base64 encode it. Preserve the key across deploys because it encrypts the verification token needed for reprinting PDFs. `DATABASE_URL` is used for pooled application traffic; `DIRECT_DATABASE_URL` is the direct Neon endpoint for Prisma CLI migrations. Do not expose these values to client code. Existing profile-photo upload support uses optional R2 settings; they are not required for the database or certificate workflows without photos.

## Current boundary

Implemented workflows include Arabic/English UI switching, organization-scoped certificate create, edit, renew, revoke, search, pagination, audit/version records, private photo uploads, hashed and encrypted verification tokens, public verification with a database-backed rate limit, and bilingual PDF preview/download with a QR code. Provision an initial OWNER account securely before use. Organization/team administration, database-backed API tests, and live deployment acceptance remain. Netlify deployment and live Neon/R2 integration have not been run from this workspace.
