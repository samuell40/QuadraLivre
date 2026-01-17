/*
  Warnings:

  - You are about to drop the column `timeId` on the `Jogador` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `Jogador` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Jogador" DROP CONSTRAINT "Jogador_timeId_fkey";

-- AlterTable
ALTER TABLE "Jogador" DROP COLUMN "timeId";

-- CreateTable
CREATE TABLE "JogadorTime" (
    "id" SERIAL NOT NULL,
    "jogadorId" INTEGER NOT NULL,
    "timeId" INTEGER NOT NULL,
    "modalidadeId" INTEGER NOT NULL,

    CONSTRAINT "JogadorTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "JogadorTime_jogadorId_modalidadeId_key" ON "JogadorTime"("jogadorId", "modalidadeId");

-- CreateIndex
CREATE UNIQUE INDEX "Jogador_usuarioId_key" ON "Jogador"("usuarioId");

-- AddForeignKey
ALTER TABLE "JogadorTime" ADD CONSTRAINT "JogadorTime_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JogadorTime" ADD CONSTRAINT "JogadorTime_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JogadorTime" ADD CONSTRAINT "JogadorTime_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
