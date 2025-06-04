/*
  Warnings:

  - A unique constraint covering the columns `[time]` on the table `Placar` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Placar_time_key" ON "Placar"("time");
