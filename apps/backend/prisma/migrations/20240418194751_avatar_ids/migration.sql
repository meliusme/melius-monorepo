/*
  Warnings:

  - A unique constraint covering the columns `[docId,userId]` on the table `Avatar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Avatar_docId_userId_key" ON "Avatar"("docId", "userId");
