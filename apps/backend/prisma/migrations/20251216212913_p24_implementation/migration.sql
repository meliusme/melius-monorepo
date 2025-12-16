/*
  Warnings:

  - A unique constraint covering the columns `[p24SessionId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('stripe', 'p24');

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "p24OrderId" INTEGER,
ADD COLUMN     "p24SessionId" TEXT,
ADD COLUMN     "p24Token" TEXT,
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'stripe';

-- CreateIndex
CREATE UNIQUE INDEX "Payment_p24SessionId_key" ON "Payment"("p24SessionId");
