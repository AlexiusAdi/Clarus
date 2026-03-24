/*
  Warnings:

  - You are about to drop the column `amount` on the `Investment` table. All the data in the column will be lost.
  - Added the required column `amountInvested` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentValue` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AcquisitionSource" AS ENUM ('PURCHASED', 'GIFTED', 'INHERITED', 'OTHER');

-- AlterEnum
ALTER TYPE "AssetType" ADD VALUE 'GOLD';

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "acquisitionSource" "AcquisitionSource" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "amount",
ADD COLUMN     "amountInvested" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "currentValue" DOUBLE PRECISION NOT NULL;
