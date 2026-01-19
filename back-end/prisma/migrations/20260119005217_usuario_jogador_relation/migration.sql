/*
  Warnings:

  - A unique constraint covering the columns `[jogadorId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "jogadorId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_jogadorId_key" ON "Usuario"("jogadorId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_jogadorId_fkey" FOREIGN KEY ("jogadorId") REFERENCES "Jogador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
