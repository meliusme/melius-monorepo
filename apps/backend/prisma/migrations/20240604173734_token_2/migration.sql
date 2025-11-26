/*
  Warnings:

  - You are about to drop the column `tokenActiveAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "tokenActiveAt",
ADD COLUMN     "tokenActivatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
