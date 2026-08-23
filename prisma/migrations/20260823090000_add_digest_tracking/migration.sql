-- AlterTable
ALTER TABLE "UserDetail" DROP COLUMN "notificationDay",
ADD COLUMN     "lastDigestSentAt" TIMESTAMP(3);
