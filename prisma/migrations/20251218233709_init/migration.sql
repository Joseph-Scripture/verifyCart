-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('NOT_SUBMITTED', 'PARTIALLY_VERIFIED', 'VERIFIED', 'REVOKED');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('ID', 'ADDRESS', 'REGISTRATION');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "status" "VendorStatus" NOT NULL DEFAULT 'NOT_SUBMITTED',
    "trustScore" INTEGER NOT NULL DEFAULT 0,
    "badgeId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationItem" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_email_key" ON "Vendor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "VerificationItem_vendorId_type_idx" ON "VerificationItem"("vendorId", "type");

-- AddForeignKey
ALTER TABLE "VerificationItem" ADD CONSTRAINT "VerificationItem_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
