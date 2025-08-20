/*
  Warnings:

  - You are about to drop the column `foto` on the `Placar` table. All the data in the column will be lost.
  - You are about to drop the column `modalidadeId` on the `Placar` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `Placar` table. All the data in the column will be lost.
  - Added the required column `timeId` to the `Placar` table without a default value. This is not possible if the table is not empty.
  - Made the column `empates` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `setsVencidos` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cartoesAmarelos` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `cartoesVermelhos` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `derrota2x0` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `derrota2x1` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `derrotaWo` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `golsPro` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `golsSofridos` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `saldoDeGols` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vitoria2x1` on table `Placar` required. This step will fail if there are existing NULL values in that column.
  - Made the column `vitoria2x0` on table `Placar` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Placar" DROP CONSTRAINT "Placar_modalidadeId_fkey";

-- DropIndex
DROP INDEX "Placar_modalidadeId_time_key";

-- AlterTable
ALTER TABLE "Agendamento" ALTER COLUMN "status" SET DEFAULT 'Pendente',
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Placar" DROP COLUMN "foto",
DROP COLUMN "modalidadeId",
DROP COLUMN "time",
ADD COLUMN     "timeId" INTEGER NOT NULL,
ADD COLUMN     "visivel" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "pontuacao" SET DEFAULT 0,
ALTER COLUMN "vitorias" SET DEFAULT 0,
ALTER COLUMN "derrotas" SET DEFAULT 0,
ALTER COLUMN "empates" SET NOT NULL,
ALTER COLUMN "empates" SET DEFAULT 0,
ALTER COLUMN "posicao" SET DEFAULT 0,
ALTER COLUMN "setsVencidos" SET NOT NULL,
ALTER COLUMN "setsVencidos" SET DEFAULT 0,
ALTER COLUMN "cartoesAmarelos" SET NOT NULL,
ALTER COLUMN "cartoesAmarelos" SET DEFAULT 0,
ALTER COLUMN "cartoesVermelhos" SET NOT NULL,
ALTER COLUMN "cartoesVermelhos" SET DEFAULT 0,
ALTER COLUMN "derrota2x0" SET NOT NULL,
ALTER COLUMN "derrota2x0" SET DEFAULT 0,
ALTER COLUMN "derrota2x1" SET NOT NULL,
ALTER COLUMN "derrota2x1" SET DEFAULT 0,
ALTER COLUMN "derrotaWo" SET NOT NULL,
ALTER COLUMN "derrotaWo" SET DEFAULT 0,
ALTER COLUMN "golsPro" SET NOT NULL,
ALTER COLUMN "golsPro" SET DEFAULT 0,
ALTER COLUMN "golsSofridos" SET NOT NULL,
ALTER COLUMN "golsSofridos" SET DEFAULT 0,
ALTER COLUMN "jogos" SET DEFAULT 0,
ALTER COLUMN "saldoDeGols" SET NOT NULL,
ALTER COLUMN "saldoDeGols" SET DEFAULT 0,
ALTER COLUMN "vitoria2x1" SET NOT NULL,
ALTER COLUMN "vitoria2x1" SET DEFAULT 0,
ALTER COLUMN "vitoria2x0" SET NOT NULL,
ALTER COLUMN "vitoria2x0" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Time" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "foto" VARCHAR(2048),
    "modalidadeId" INTEGER NOT NULL,

    CONSTRAINT "Time_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsuarioTime" (
    "usuarioId" INTEGER NOT NULL,
    "timeId" INTEGER NOT NULL,

    CONSTRAINT "UsuarioTime_pkey" PRIMARY KEY ("usuarioId","timeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Time_modalidadeId_nome_key" ON "Time"("modalidadeId", "nome");

-- AddForeignKey
ALTER TABLE "Time" ADD CONSTRAINT "Time_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Placar" ADD CONSTRAINT "Placar_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioTime" ADD CONSTRAINT "UsuarioTime_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsuarioTime" ADD CONSTRAINT "UsuarioTime_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
