/*
  Warnings:

  - A unique constraint covering the columns `[vendorId,type]` on the table `VerificationItem` will be added. If there are existing duplicate values, this will fail.
  - Made the column `socialLinks` on table `Vendor` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('APPROVE_VERIFICATION', 'REJECT_VERIFICATION', 'ISSUE_BADGE', 'UPDATE_VENDOR_STATUS', 'REVOKE_VENDOR');

-- CreateEnum
CREATE TYPE "AuditTargetType" AS ENUM ('VENDOR', 'VERIFICATION_ITEM');

-- DropIndex
DROP INDEX "VerificationItem_vendorId_type_idx";

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lockUntil" TIMESTAMP(3),
ALTER COLUMN "socialLinks" SET NOT NULL;

-- CreateIndex
CREATE INDEX "VerificationItem_vendorId_idx" ON "VerificationItem"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationItem_vendorId_type_key" ON "VerificationItem"("vendorId", "type");
