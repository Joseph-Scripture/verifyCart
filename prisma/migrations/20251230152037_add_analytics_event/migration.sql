-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('PROFILE_VIEW', 'BADGE_CLICK');

-- CreateEnum
CREATE TYPE "AnalyticsSource" AS ENUM ('INSTAGRAM', 'WHATSAPP', 'FACEBOOK', 'WEBSITE', 'DIRECT', 'TIKTOK');

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "type" "AnalyticsEventType" NOT NULL,
    "source" "AnalyticsSource",
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnalyticsEvent_vendorId_idx" ON "AnalyticsEvent"("vendorId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_type_idx" ON "AnalyticsEvent"("type");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_createdAt_idx" ON "AnalyticsEvent"("createdAt");

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
