/*
  Warnings:

  - You are about to drop the column `ativo` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `cancelada` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `emIntervalo` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `finalizada` on the `Partida` table. All the data in the column will be lost.
  - You are about to drop the column `partidaIniciada` on the `Partida` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "StatusPartida" AS ENUM ('AGENDADA', 'EM_ANDAMENTO', 'FINALIZADA', 'CANCELADA', 'DELETADA');

-- AlterTable
ALTER TABLE "Partida" DROP COLUMN "ativo",
DROP COLUMN "cancelada",
DROP COLUMN "deletedAt",
DROP COLUMN "emIntervalo",
DROP COLUMN "finalizada",
DROP COLUMN "partidaIniciada",
ADD COLUMN     "status" "StatusPartida" NOT NULL DEFAULT 'AGENDADA';
