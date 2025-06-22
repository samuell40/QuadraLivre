/*
  Warnings:

  - You are about to drop the column `modalidade` on the `Placar` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[modalidadeId,time]` on the table `Placar` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `modalidadeId` to the `Placar` table without a default value. This is not possible if the table is not empty.
  - Made the column `time` on table `Placar` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX "Placar_modalidade_time_key";

-- AlterTable
ALTER TABLE "Placar" DROP COLUMN "modalidade",
ADD COLUMN     "modalidadeId" INTEGER NOT NULL,
ALTER COLUMN "time" SET NOT NULL;

-- CreateTable
CREATE TABLE "Modalidade" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Modalidade_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Modalidade_nome_key" ON "Modalidade"("nome");

-- CreateIndex
CREATE UNIQUE INDEX "Placar_modalidadeId_time_key" ON "Placar"("modalidadeId", "time");

-- AddForeignKey
ALTER TABLE "Placar" ADD CONSTRAINT "Placar_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
