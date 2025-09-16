/*
  Warnings:

  - You are about to drop the column `cartoesAmarelosTimeA` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `cartoesAmarelosTimeB` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `cartoesVermelhosTimeA` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `cartoesVermelhosTimeB` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `cartoesAmarelos` on the `Placar` table. All the data in the column will be lost.
  - You are about to drop the column `cartoesVermelhos` on the `Placar` table. All the data in the column will be lost.
  - You are about to drop the column `derrota2x0` on the `Placar` table. All the data in the column will be lost.
  - You are about to drop the column `derrota2x1` on the `Placar` table. All the data in the column will be lost.
  - You are about to drop the column `vitoria2x0` on the `Placar` table. All the data in the column will be lost.
  - You are about to drop the column `vitoria2x1` on the `Placar` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "datahora" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Partida" DROP COLUMN "cartoesAmarelosTimeA",
DROP COLUMN "cartoesAmarelosTimeB",
DROP COLUMN "cartoesVermelhosTimeA",
DROP COLUMN "cartoesVermelhosTimeB";

-- AlterTable
ALTER TABLE "Placar" DROP COLUMN "cartoesAmarelos",
DROP COLUMN "cartoesVermelhos",
DROP COLUMN "derrota2x0",
DROP COLUMN "derrota2x1",
DROP COLUMN "vitoria2x0",
DROP COLUMN "vitoria2x1",
ADD COLUMN     "derrota0x3" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "derrota2x3" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vitoria3x0" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "vitoria3x2" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "Jogador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "foto" VARCHAR(2048),
    "gols" INTEGER NOT NULL DEFAULT 0,
    "cartoesAmarelos" INTEGER NOT NULL DEFAULT 0,
    "cartoesVermelhos" INTEGER NOT NULL DEFAULT 0,
    "timeId" INTEGER NOT NULL,
    "partidaId" INTEGER NOT NULL,

    CONSTRAINT "Jogador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Jogador" ADD CONSTRAINT "Jogador_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jogador" ADD CONSTRAINT "Jogador_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
