/*
  Warnings:

  - A unique constraint covering the columns `[problemKey]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[specializationKey]` on the table `Specialization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Problem_problemKey_key" ON "Problem"("problemKey");

-- CreateIndex
CREATE UNIQUE INDEX "Specialization_specializationKey_key" ON "Specialization"("specializationKey");
