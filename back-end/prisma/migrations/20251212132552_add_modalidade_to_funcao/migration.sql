/*
  Warnings:

  - Added the required column `modalidadeId` to the `FuncaoJogador` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "FuncaoJogador" ADD COLUMN     "modalidadeId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "FuncaoJogador" ADD CONSTRAINT "FuncaoJogador_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
