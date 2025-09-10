/*
  Warnings:

  - Added the required column `usuarioCriadorId` to the `Partida` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Partida" ADD COLUMN     "faltasTimeA" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "faltasTimeB" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "substituicoesTimeA" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "substituicoesTimeB" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usuarioCriadorId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_usuarioCriadorId_fkey" FOREIGN KEY ("usuarioCriadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
