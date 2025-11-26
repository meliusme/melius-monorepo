-- CreateEnum
CREATE TYPE "Language" AS ENUM ('pl', 'en');

-- AlterEnum
ALTER TYPE "Profession" ADD VALUE 'sexologist';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailConfirmed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "language" "Language" NOT NULL DEFAULT 'pl';
