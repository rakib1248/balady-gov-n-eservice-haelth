-- Additive-only changes for owner-managed staff accounts.
ALTER TYPE "UserRole" ADD VALUE 'STAFF';

ALTER TABLE "User"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT TRUE;
