/*
  Warnings:

  - Added the required column `userId` to the `Ratings` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Ratings" ADD COLUMN     "userId" INTEGER NOT NULL;
