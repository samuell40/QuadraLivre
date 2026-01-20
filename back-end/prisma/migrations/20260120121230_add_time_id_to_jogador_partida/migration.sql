/*
  Warnings:

  - Added the required column `timeId` to the `JogadorPartida` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "JogadorPartida" ADD COLUMN     "timeId" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "JogadorPartida_partidaId_idx" ON "JogadorPartida"("partidaId");

-- CreateIndex
CREATE INDEX "JogadorPartida_timeId_idx" ON "JogadorPartida"("timeId");

-- AddForeignKey
ALTER TABLE "JogadorPartida" ADD CONSTRAINT "JogadorPartida_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
