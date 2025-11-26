/*
  Warnings:

  - You are about to drop the column `experience` on the `DocProfile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Profession" AS ENUM ('psychologist', 'psychotherapist');

-- AlterTable
ALTER TABLE "DocProfile" DROP COLUMN "experience",
ADD COLUMN     "profession" "Profession";
