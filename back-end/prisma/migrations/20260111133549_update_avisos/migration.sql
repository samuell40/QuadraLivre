-- AlterTable
ALTER TABLE "Aviso" ADD COLUMN     "fixado" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AvisoLeitura" (
    "id" SERIAL NOT NULL,
    "lidoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuarioId" INTEGER NOT NULL,
    "avisoId" INTEGER NOT NULL,

    CONSTRAINT "AvisoLeitura_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AvisoLeitura_usuarioId_avisoId_key" ON "AvisoLeitura"("usuarioId", "avisoId");

-- AddForeignKey
ALTER TABLE "AvisoLeitura" ADD CONSTRAINT "AvisoLeitura_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvisoLeitura" ADD CONSTRAINT "AvisoLeitura_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "Aviso"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
