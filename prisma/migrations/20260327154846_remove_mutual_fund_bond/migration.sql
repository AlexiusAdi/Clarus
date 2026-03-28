/*
  Warnings:

  - The values [MUTUAL_FUND,BOND] on the enum `InvestmentType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "InvestmentType_new" AS ENUM ('STOCK', 'CRYPTO', 'GOLD', 'OTHER');
ALTER TABLE "Investment" ALTER COLUMN "type" TYPE "InvestmentType_new" USING ("type"::text::"InvestmentType_new");
ALTER TABLE "AssetPrice" ALTER COLUMN "type" TYPE "InvestmentType_new" USING ("type"::text::"InvestmentType_new");
ALTER TYPE "InvestmentType" RENAME TO "InvestmentType_old";
ALTER TYPE "InvestmentType_new" RENAME TO "InvestmentType";
DROP TYPE "public"."InvestmentType_old";
COMMIT;
