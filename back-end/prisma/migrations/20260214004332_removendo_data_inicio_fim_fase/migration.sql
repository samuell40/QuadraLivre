/*
  Warnings:

  - You are about to drop the column `dataFim` on the `Fase` table. All the data in the column will be lost.
  - You are about to drop the column `dataInicio` on the `Fase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Fase" DROP COLUMN "dataFim",
DROP COLUMN "dataInicio";
