/*
  Warnings:

  - A unique constraint covering the columns `[dataSourceId]` on the table `Comparator` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[comparatorId]` on the table `DataSource` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Comparator" ADD COLUMN     "dataSourceId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Comparator_dataSourceId_key" ON "Comparator"("dataSourceId");

-- CreateIndex
CREATE UNIQUE INDEX "DataSource_comparatorId_key" ON "DataSource"("comparatorId");
