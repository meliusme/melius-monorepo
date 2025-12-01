/*
  Warnings:

  - You are about to drop the column `workEnd` on the `DocProfile` table. All the data in the column will be lost.
  - You are about to drop the column `workStart` on the `DocProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocProfile" DROP COLUMN "workEnd",
DROP COLUMN "workStart";
