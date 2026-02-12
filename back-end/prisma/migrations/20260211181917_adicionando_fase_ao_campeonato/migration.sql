/*
  Warnings:

  - A unique constraint covering the columns `[campeonatoId,faseId,timeId]` on the table `Placar` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Placar_campeonatoId_timeId_key";

-- AlterTable
ALTER TABLE "Partida" ADD COLUMN     "faseId" INTEGER;

-- AlterTable
ALTER TABLE "Placar" ADD COLUMN     "faseId" INTEGER;

-- CreateTable
CREATE TABLE "Fase" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "campeonatoId" INTEGER NOT NULL,
    "rodada" INTEGER NOT NULL,
    "dataInicio" TIMESTAMP(3),
    "dataFim" TIMESTAMP(3),
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Fase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Placar_campeonatoId_faseId_timeId_key" ON "Placar"("campeonatoId", "faseId", "timeId");

-- AddForeignKey
ALTER TABLE "Fase" ADD CONSTRAINT "Fase_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_faseId_fkey" FOREIGN KEY ("faseId") REFERENCES "Fase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placar" ADD CONSTRAINT "Placar_faseId_fkey" FOREIGN KEY ("faseId") REFERENCES "Fase"("id") ON DELETE SET NULL ON UPDATE CASCADE;
