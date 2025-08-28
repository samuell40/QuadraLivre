-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "modalidadeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade"("id") ON DELETE SET NULL ON UPDATE CASCADE;
