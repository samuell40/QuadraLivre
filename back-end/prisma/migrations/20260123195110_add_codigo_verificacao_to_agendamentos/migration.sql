/*
  Warnings:

  - A unique constraint covering the columns `[codigoVerificacao]` on the table `Agendamento` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "codigoVerificacao" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Agendamento_codigoVerificacao_key" ON "Agendamento"("codigoVerificacao");
