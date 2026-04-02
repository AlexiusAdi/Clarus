/*
  Warnings:

  - You are about to drop the column `TotalInvestment` on the `Investment` table. All the data in the column will be lost.
  - Added the required column `totalInvestment` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "TotalInvestment",
ADD COLUMN     "totalInvestment" DECIMAL(18,2) NOT NULL;
