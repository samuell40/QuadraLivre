/*
  Warnings:

  - You are about to drop the column `rodada` on the `Fase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fase" DROP COLUMN "rodada";

-- AlterTable
ALTER TABLE "Partida" ADD COLUMN     "rodadaId" INTEGER;

-- CreateTable
CREATE TABLE "Rodada" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "faseId" INTEGER NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Rodada_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Rodada_faseId_nome_key" ON "Rodada"("faseId", "nome");

-- AddForeignKey
ALTER TABLE "Rodada" ADD CONSTRAINT "Rodada_faseId_fkey" FOREIGN KEY ("faseId") REFERENCES "Fase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_rodadaId_fkey" FOREIGN KEY ("rodadaId") REFERENCES "Rodada"("id") ON DELETE SET NULL ON UPDATE CASCADE;
