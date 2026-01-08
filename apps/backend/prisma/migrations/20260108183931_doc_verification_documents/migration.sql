-- CreateTable
CREATE TABLE "DocVerificationDocument" (
    "id" SERIAL NOT NULL,
    "docId" INTEGER NOT NULL,
    "fileKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "originalName" TEXT NOT NULL,
    "uploadedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocVerificationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DocVerificationDocument_docId_idx" ON "DocVerificationDocument"("docId");

-- AddForeignKey
ALTER TABLE "DocVerificationDocument" ADD CONSTRAINT "DocVerificationDocument_docId_fkey" FOREIGN KEY ("docId") REFERENCES "DocProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
