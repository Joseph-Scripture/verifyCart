/*
  Warnings:

  - You are about to drop the column `statusLinks` on the `Vendor` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vendor" DROP COLUMN "statusLinks",
ADD COLUMN     "socialLinks" JSONB;
