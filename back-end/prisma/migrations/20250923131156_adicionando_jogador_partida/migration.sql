/*
  Warnings:

  - You are about to drop the column `cartoesAmarelos` on the `Jogador` table. All the data in the column will be lost.
  - You are about to drop the column `cartoesVermelhos` on the `Jogador` table. All the data in the column will be lost.
  - You are about to drop the column `gols` on the `Jogador` table. All the data in the column will be lost.
  - You are about to drop the column `partidaId` on the `Jogador` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Jogador" DROP CONSTRAINT "Jogador_partidaId_fkey";

-- AlterTable
ALTER TABLE "Jogador" DROP COLUMN "cartoesAmarelos",
DROP COLUMN "cartoesVermelhos",
DROP COLUMN "gols",
DROP COLUMN "partidaId";

-- CreateTable
CREATE TABLE "JogadorPartida" (
    "id" SERIAL NOT NULL,
    "jogadorId" INTEGER NOT NULL,
    "partidaId" INTEGER NOT NULL,
    "gols" INTEGER NOT NULL DEFAULT 0,
    "cartoesAmarelos" INTEGER NOT NULL DEFAULT 0,
    "cartoesVermelhos" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "JogadorPartida_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JogadorPartida" ADD CONSTRAINT "JogadorPartida_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JogadorPartida" ADD CONSTRAINT "JogadorPartida_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
