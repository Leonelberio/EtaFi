/*
  Warnings:

  - You are about to drop the `Comparator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataSource` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SelectedColumn` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SelectedRow` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Comparator";

-- DropTable
DROP TABLE "DataSource";

-- DropTable
DROP TABLE "SelectedColumn";

-- DropTable
DROP TABLE "SelectedRow";

-- DropEnum
DROP TYPE "DataSourceType";

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "nif" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "logo" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exercice" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "companyId" TEXT NOT NULL,

    CONSTRAINT "Exercice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinancialAccount" (
    "id" TEXT NOT NULL,
    "accountCode" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "exerciceId" TEXT NOT NULL,

    CONSTRAINT "FinancialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "debitAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "creditAmount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "exerciceId" TEXT NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_userId_name_key" ON "Company"("userId", "name");

-- CreateIndex
CREATE INDEX "Exercice_companyId_idx" ON "Exercice"("companyId");

-- CreateIndex
CREATE INDEX "FinancialAccount_exerciceId_idx" ON "FinancialAccount"("exerciceId");

-- CreateIndex
CREATE INDEX "Transaction_exerciceId_idx" ON "Transaction"("exerciceId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");
