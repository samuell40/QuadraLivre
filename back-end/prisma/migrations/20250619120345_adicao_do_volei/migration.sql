/*
  Warnings:

  - A unique constraint covering the columns `[modalidade,time]` on the table `Placar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `modalidade` to the `Placar` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posicao` to the `Placar` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Placar" ADD COLUMN     "modalidade" TEXT NOT NULL,
ADD COLUMN     "posicao" INTEGER NOT NULL,
ADD COLUMN     "setsVencidos" INTEGER,
ALTER COLUMN "empates" DROP NOT NULL,
ALTER COLUMN "golsMarcados" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Placar_modalidade_time_key" ON "Placar"("modalidade", "time");
