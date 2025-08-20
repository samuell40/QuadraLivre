/*
  Warnings:

  - A unique constraint covering the columns `[timeId]` on the table `Placar` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Time_modalidadeId_nome_key";

-- CreateIndex
CREATE UNIQUE INDEX "Placar_timeId_key" ON "Placar"("timeId");
