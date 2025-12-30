/*
  Warnings:

  - The values [REMOVED] on the enum `ReviewStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `comment` on table `Review` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ReviewStatus_new" AS ENUM ('PENDING', 'VISIBLE', 'HIDDEN');
ALTER TABLE "Review" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Review" ALTER COLUMN "status" TYPE "ReviewStatus_new" USING ("status"::text::"ReviewStatus_new");
ALTER TYPE "ReviewStatus" RENAME TO "ReviewStatus_old";
ALTER TYPE "ReviewStatus_new" RENAME TO "ReviewStatus";
DROP TYPE "ReviewStatus_old";
ALTER TABLE "Review" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "comment" SET NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Review_status_idx" ON "Review"("status");
