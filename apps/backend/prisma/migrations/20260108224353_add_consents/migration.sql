-- AlterTable
ALTER TABLE "DocProfile" ADD COLUMN     "docTermsAccepted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "consentAdult" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentHealthData" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "consentTerms" BOOLEAN NOT NULL DEFAULT false;
