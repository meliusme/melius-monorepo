/*
  Warnings:

  - A unique constraint covering the columns `[meetingId,userId]` on the table `Rating` will be added. If there are existing duplicate values, this will fail.
  - Made the column `meetingId` on table `Rating` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Rating" DROP CONSTRAINT "Rating_meetingId_fkey";

-- AlterTable
ALTER TABLE "Rating" ALTER COLUMN "meetingId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Rating_meetingId_userId_key" ON "Rating"("meetingId", "userId");

-- AddForeignKey
ALTER TABLE "Rating" ADD CONSTRAINT "Rating_meetingId_fkey" FOREIGN KEY ("meetingId") REFERENCES "Meeting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
