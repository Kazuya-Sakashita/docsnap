/*
  Warnings:

  - A unique constraint covering the columns `[userId,fingerprint]` on the table `receipts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `fingerprint` to the `receipts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `normalizedJson` to the `receipts` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rawOcrText` to the `receipts` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OcrEngine" AS ENUM ('TESSERACT', 'GOOGLE_DOC_AI', 'AWS_TEXTRACT', 'AZURE_FORM_RECOGNIZER', 'OTHER');

-- AlterTable
ALTER TABLE "receipt_items" ADD COLUMN     "rawLine" TEXT,
ADD COLUMN     "taxRate" DOUBLE PRECISION,
ALTER COLUMN "unitPrice" DROP NOT NULL,
ALTER COLUMN "amount" DROP NOT NULL;

-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "fingerprint" TEXT NOT NULL,
ADD COLUMN     "isDuplicateOfId" UUID,
ADD COLUMN     "normalizedJson" JSONB NOT NULL,
ADD COLUMN     "ocrEngine" "OcrEngine",
ADD COLUMN     "parseVersion" TEXT,
ADD COLUMN     "parser" TEXT,
ADD COLUMN     "rawOcrText" TEXT NOT NULL,
ADD COLUMN     "taxBreakdownJson" JSONB;

-- CreateTable
CREATE TABLE "receipt_files" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "receiptId" UUID NOT NULL,
    "page" INTEGER,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "sha256" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "receipt_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "receipt_files_receiptId_idx" ON "receipt_files"("receiptId");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_userId_fingerprint_key" ON "receipts"("userId", "fingerprint");

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_isDuplicateOfId_fkey" FOREIGN KEY ("isDuplicateOfId") REFERENCES "receipts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_files" ADD CONSTRAINT "receipt_files_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
