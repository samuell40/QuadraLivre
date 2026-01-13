/*
  Warnings:

  - You are about to alter the column `foto` on the `Aviso` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(2048)`.

*/
-- AlterTable
ALTER TABLE "Aviso" ALTER COLUMN "foto" SET DATA TYPE VARCHAR(2048);

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
ALTER TABLE "AvisoLeitura" ADD CONSTRAINT "AvisoLeitura_avisoId_fkey" FOREIGN KEY ("avisoId") REFERENCES "Aviso"("id") ON DELETE CASCADE ON UPDATE CASCADE;
