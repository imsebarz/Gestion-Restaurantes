/*
  Warnings:

  - A unique constraint covering the columns `[qrCode]` on the table `tables` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "tables" ADD COLUMN     "qrCode" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tables_qrCode_key" ON "tables"("qrCode");
