-- CreateTable
CREATE TABLE "AccountPlan" (
    "id" TEXT NOT NULL,
    "numero_compte" TEXT NOT NULL,
    "libelle_compte" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountPlan_numero_compte_key" ON "AccountPlan"("numero_compte");
