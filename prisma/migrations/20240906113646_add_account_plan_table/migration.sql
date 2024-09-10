/*
  Warnings:

  - Changed the type of `name` on the `Exercice` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Exercice" DROP COLUMN "name",
ADD COLUMN     "name" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "AccountPlan" (
    "id" TEXT NOT NULL,
    "numero_compte" TEXT NOT NULL,
    "libelle_compte" TEXT NOT NULL,
    "classe" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountPlan_numero_compte_key" ON "AccountPlan"("numero_compte");
