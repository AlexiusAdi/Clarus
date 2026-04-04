-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "premiumExpiresAt" TIMESTAMP(3);
