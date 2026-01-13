-- DropForeignKey
ALTER TABLE "AvisoLeitura" DROP CONSTRAINT "AvisoLeitura_avisoId_fkey";

-- AddForeignKey
ALTER TABLE "AvisoLeitura" ADD CONSTRAINT "AvisoLeitura_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "Aviso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
