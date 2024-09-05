/*
  Warnings:

  - Changed the type of `type` on the `DataSource` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('GoogleSheets', 'Notion', 'Airtable', 'Other');

-- AlterTable
ALTER TABLE "DataSource" ADD COLUMN     "notionPageId" TEXT,
ALTER COLUMN "authKey" DROP NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "DataSourceType" NOT NULL,
ALTER COLUMN "sheetId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "SelectedColumn" ALTER COLUMN "tabName" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SelectedRow" (
    "id" TEXT NOT NULL,
    "dataSourceId" TEXT NOT NULL,
    "tabName" TEXT,
    "rowName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SelectedRow_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SelectedRow_dataSourceId_idx" ON "SelectedRow"("dataSourceId");

-- CreateIndex
CREATE INDEX "DataSource_userId_idx" ON "DataSource"("userId");
