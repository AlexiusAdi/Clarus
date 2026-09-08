-- AlterTable
ALTER TABLE "UserDetail" ADD COLUMN     "openingBalance" DECIMAL(18,2) NOT NULL DEFAULT 0,
ADD COLUMN     "openingBalanceDate" TIMESTAMP(3),
ADD COLUMN     "openingBalanceSetAt" TIMESTAMP(3);
