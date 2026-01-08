/*
  Warnings:

  - A unique constraint covering the columns `[campeonatoId,timeId]` on the table `Placar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `campeonatoId` to the `Placar` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Placar_timeId_key";

-- AlterTable
ALTER TABLE "Partida" ADD COLUMN     "campeonatoId" INTEGER;

-- AlterTable
ALTER TABLE "Placar" ADD COLUMN     "campeonatoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Campeonato" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "dataInicio" TIMESTAMP(3) NOT NULL,
    "dataFim" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'EM_ANDAMENTO',
    "modalidadeId" INTEGER NOT NULL,
    "quadraId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campeonato_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampeonatoTime" (
    "campeonatoId" INTEGER NOT NULL,
    "timeId" INTEGER NOT NULL,

    CONSTRAINT "CampeonatoTime_pkey" PRIMARY KEY ("campeonatoId","timeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Placar_campeonatoId_timeId_key" ON "Placar"("campeonatoId", "timeId");

-- AddForeignKey
ALTER TABLE "Campeonato" ADD CONSTRAINT "Campeonato_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campeonato" ADD CONSTRAINT "Campeonato_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "Quadra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampeonatoTime" ADD CONSTRAINT "CampeonatoTime_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampeonatoTime" ADD CONSTRAINT "CampeonatoTime_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placar" ADD CONSTRAINT "Placar_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
