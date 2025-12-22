/*
  Warnings:

  - You are about to drop the column `published` on the `DocProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "DocVerificationStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "DocProfile" DROP COLUMN "published",
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMPTZ,
ADD COLUMN     "submittedAt" TIMESTAMPTZ,
ADD COLUMN     "verificationStatus" "DocVerificationStatus" NOT NULL DEFAULT 'draft';
