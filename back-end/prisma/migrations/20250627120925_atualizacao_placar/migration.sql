/*
  Warnings:

  - You are about to drop the column `golsMarcados` on the `Placar` table. All the data in the column will be lost.
  - Added the required column `jogos` to the `Placar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Placar" DROP COLUMN "golsMarcados",
ADD COLUMN     "cartoesAmarelos" INTEGER,
ADD COLUMN     "cartoesVermelhos" INTEGER,
ADD COLUMN     "derrota2x0" INTEGER,
ADD COLUMN     "derrota2x1" INTEGER,
ADD COLUMN     "derrotaWo" INTEGER,
ADD COLUMN     "golsPro" INTEGER,
ADD COLUMN     "golsSofridos" INTEGER,
ADD COLUMN     "jogos" INTEGER NOT NULL,
ADD COLUMN     "saldoDeGols" INTEGER,
ADD COLUMN     "vitoria2x1" INTEGER,
ADD COLUMN     "vitoria3x0" INTEGER;
