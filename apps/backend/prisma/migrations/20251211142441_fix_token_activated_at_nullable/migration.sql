-- AlterTable
ALTER TABLE "User" ALTER COLUMN "tokenActivatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "tokenActivatedAt" DROP NOT NULL;
