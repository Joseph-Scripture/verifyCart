/*
  Warnings:

  - You are about to drop the column `isVisible` on the `Review` table. All the data in the column will be lost.
  - You are about to drop the column `reviewerName` on the `Review` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('VISIBLE', 'HIDDEN', 'REMOVED');

-- AlterTable
ALTER TABLE "Review" DROP COLUMN "isVisible",
DROP COLUMN "reviewerName",
ADD COLUMN     "reviewer" TEXT,
ADD COLUMN     "status" "ReviewStatus" NOT NULL DEFAULT 'VISIBLE';
