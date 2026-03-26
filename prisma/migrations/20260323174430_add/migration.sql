-- AlterEnum
ALTER TYPE "TransactionType" ADD VALUE 'SAVINGS';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_premium" BOOLEAN NOT NULL DEFAULT false;
