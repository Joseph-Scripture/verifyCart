-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "resetCode" TEXT,
ADD COLUMN     "resetCodeExpiresAt" TIMESTAMP(3);
