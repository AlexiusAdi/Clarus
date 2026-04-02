/*
  Warnings:

  - Added the required column `totalInvestment` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Investment" ADD COLUMN     "totalInvestment" DECIMAL(18,2) NOT NULL;
