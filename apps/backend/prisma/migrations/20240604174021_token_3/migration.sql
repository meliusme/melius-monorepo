/*
  Warnings:

  - You are about to drop the column `adminProfileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `docProfileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userProfileId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocProfile" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "adminProfileId",
DROP COLUMN "docProfileId",
DROP COLUMN "userProfileId";
