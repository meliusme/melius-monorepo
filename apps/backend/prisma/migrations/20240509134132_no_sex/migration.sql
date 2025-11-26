/*
  Warnings:

  - You are about to drop the column `sex` on the `DocProfile` table. All the data in the column will be lost.
  - You are about to drop the column `sex` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocProfile" DROP COLUMN "sex";

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "sex";
