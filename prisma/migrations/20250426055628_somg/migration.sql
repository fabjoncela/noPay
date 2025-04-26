-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "lockedConversionId" TEXT;

-- CreateTable
CREATE TABLE "LockedConversion" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "sourceWalletId" TEXT NOT NULL,
    "targetWalletId" TEXT NOT NULL,
    "sourceAmount" DOUBLE PRECISION NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "sourceCurrency" TEXT NOT NULL,
    "targetCurrency" TEXT NOT NULL,
    "exchangeRate" DOUBLE PRECISION NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "feePercentage" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "lockDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unlockDate" TIMESTAMP(3) NOT NULL,
    "actualUnlockDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LockedConversion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LockedConversion_accountId_idx" ON "LockedConversion"("accountId");

-- CreateIndex
CREATE INDEX "LockedConversion_sourceWalletId_idx" ON "LockedConversion"("sourceWalletId");

-- CreateIndex
CREATE INDEX "LockedConversion_targetWalletId_idx" ON "LockedConversion"("targetWalletId");

-- CreateIndex
CREATE INDEX "LockedConversion_status_idx" ON "LockedConversion"("status");

-- AddForeignKey
ALTER TABLE "LockedConversion" ADD CONSTRAINT "LockedConversion_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockedConversion" ADD CONSTRAINT "LockedConversion_sourceWalletId_fkey" FOREIGN KEY ("sourceWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LockedConversion" ADD CONSTRAINT "LockedConversion_targetWalletId_fkey" FOREIGN KEY ("targetWalletId") REFERENCES "Wallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
