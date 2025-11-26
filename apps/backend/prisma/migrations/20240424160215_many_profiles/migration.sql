/*
  Warnings:

  - You are about to drop the column `docProfileId` on the `Specialization` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Problem" DROP CONSTRAINT "Problem_userProfileId_fkey";

-- DropForeignKey
ALTER TABLE "Specialization" DROP CONSTRAINT "Specialization_docProfileId_fkey";

-- AlterTable
ALTER TABLE "Specialization" DROP COLUMN "docProfileId";

-- CreateTable
CREATE TABLE "_DocProfileToSpecialization" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ProblemToUserProfile" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DocProfileToSpecialization_AB_unique" ON "_DocProfileToSpecialization"("A", "B");

-- CreateIndex
CREATE INDEX "_DocProfileToSpecialization_B_index" ON "_DocProfileToSpecialization"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProblemToUserProfile_AB_unique" ON "_ProblemToUserProfile"("A", "B");

-- CreateIndex
CREATE INDEX "_ProblemToUserProfile_B_index" ON "_ProblemToUserProfile"("B");

-- AddForeignKey
ALTER TABLE "_DocProfileToSpecialization" ADD CONSTRAINT "_DocProfileToSpecialization_A_fkey" FOREIGN KEY ("A") REFERENCES "DocProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DocProfileToSpecialization" ADD CONSTRAINT "_DocProfileToSpecialization_B_fkey" FOREIGN KEY ("B") REFERENCES "Specialization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemToUserProfile" ADD CONSTRAINT "_ProblemToUserProfile_A_fkey" FOREIGN KEY ("A") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProblemToUserProfile" ADD CONSTRAINT "_ProblemToUserProfile_B_fkey" FOREIGN KEY ("B") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
