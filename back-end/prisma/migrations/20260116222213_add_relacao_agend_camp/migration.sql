-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "campeonatoId" INTEGER;

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_campeonatoId_fkey" FOREIGN KEY ("campeonatoId") REFERENCES "Campeonato"("id") ON DELETE SET NULL ON UPDATE CASCADE;
