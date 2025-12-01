-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "clientMessage" TEXT;

-- AlterTable
ALTER TABLE "_DocProfileToSpecialization" ADD CONSTRAINT "_DocProfileToSpecialization_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_DocProfileToSpecialization_AB_unique";

-- AlterTable
ALTER TABLE "_ProblemToSpecialization" ADD CONSTRAINT "_ProblemToSpecialization_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProblemToSpecialization_AB_unique";

-- AlterTable
ALTER TABLE "_ProblemToUserProfile" ADD CONSTRAINT "_ProblemToUserProfile_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "_ProblemToUserProfile_AB_unique";
