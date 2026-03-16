/*
  Warnings:

  - You are about to drop the column `sessionPricePln` on the `DocProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DocProfile" DROP COLUMN "sessionPricePln",
ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'PLN',
ADD COLUMN     "unitAmount" INTEGER;
