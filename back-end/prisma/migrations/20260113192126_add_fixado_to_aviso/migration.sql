/*
  Warnings:

  - You are about to drop the `AvisoLeitura` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AvisoLeitura" DROP CONSTRAINT "AvisoLeitura_avisoId_fkey";

-- DropForeignKey
ALTER TABLE "AvisoLeitura" DROP CONSTRAINT "AvisoLeitura_usuarioId_fkey";

-- AlterTable
ALTER TABLE "Aviso" ALTER COLUMN "foto" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "AvisoLeitura";
