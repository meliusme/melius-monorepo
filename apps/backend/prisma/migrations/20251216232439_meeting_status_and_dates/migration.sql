/*
  Warnings:

  - Added the required column `updatedAt` to the `Meeting` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MeetingStatus" ADD VALUE 'cancelled_by_system';

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
