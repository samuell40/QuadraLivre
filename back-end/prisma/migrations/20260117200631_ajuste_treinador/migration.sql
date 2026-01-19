/*
  Warnings:

  - You are about to drop the column `usuarioId` on the `Jogador` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Jogador" DROP CONSTRAINT "Jogador_usuarioId_fkey";

-- DropIndex
DROP INDEX "Jogador_usuarioId_key";

-- AlterTable
ALTER TABLE "Jogador" DROP COLUMN "usuarioId";
