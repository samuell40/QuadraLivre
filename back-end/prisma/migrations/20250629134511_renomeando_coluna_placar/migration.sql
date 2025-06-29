/*
  Warnings:

  - You are about to drop the column `vitoria3x0` on the `Placar` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Placar" DROP COLUMN "vitoria3x0",
ADD COLUMN     "vitoria2x0" INTEGER;
