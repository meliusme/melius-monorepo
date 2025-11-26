/*
  Warnings:

  - You are about to drop the column `docId` on the `Avatar` table. All the data in the column will be lost.
  - Made the column `userId` on table `Avatar` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_docId_fkey";

-- DropForeignKey
ALTER TABLE "Avatar" DROP CONSTRAINT "Avatar_userId_fkey";

-- DropIndex
DROP INDEX "Avatar_docId_key";

-- AlterTable
ALTER TABLE "Avatar" DROP COLUMN "docId",
ALTER COLUMN "userId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Avatar" ADD CONSTRAINT "Avatar_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
