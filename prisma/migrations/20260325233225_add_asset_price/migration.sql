/*
  Warnings:

  - You are about to drop the column `amountInvested` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `currentValue` on the `Investment` table. All the data in the column will be lost.
  - You are about to drop the column `returnPct` on the `Investment` table. All the data in the column will be lost.
  - Added the required column `assetIdentifier` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `costPerUnit` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `quantity` to the `Investment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit` to the `Investment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Investment" DROP COLUMN "amountInvested",
DROP COLUMN "currentValue",
DROP COLUMN "returnPct",
ADD COLUMN     "assetIdentifier" TEXT NOT NULL,
ADD COLUMN     "costPerUnit" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "quantity" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "unit" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AssetPrice" (
    "identifier" TEXT NOT NULL,
    "type" "InvestmentType" NOT NULL,
    "priceIdr" DOUBLE PRECISION NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssetPrice_pkey" PRIMARY KEY ("identifier")
);

-- CreateIndex
CREATE INDEX "AssetPrice_type_idx" ON "AssetPrice"("type");

-- CreateIndex
CREATE INDEX "Investment_assetIdentifier_idx" ON "Investment"("assetIdentifier");

-- AddForeignKey
ALTER TABLE "Investment" ADD CONSTRAINT "Investment_assetIdentifier_fkey" FOREIGN KEY ("assetIdentifier") REFERENCES "AssetPrice"("identifier") ON DELETE RESTRICT ON UPDATE CASCADE;
