/*
  Warnings:

  - You are about to drop the column `fixo` on the `Usuario` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "fixo" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "fixo";
