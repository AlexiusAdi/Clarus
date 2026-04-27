/*
  Warnings:

  - You are about to drop the column `currency` on the `UserDetail` table. All the data in the column will be lost.
  - You are about to drop the column `incomeResetDay` on the `UserDetail` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserDetail" DROP COLUMN "currency",
DROP COLUMN "incomeResetDay",
ADD COLUMN     "emailNotification" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "financialResetDay" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "notificationDay" INTEGER NOT NULL DEFAULT 1;
