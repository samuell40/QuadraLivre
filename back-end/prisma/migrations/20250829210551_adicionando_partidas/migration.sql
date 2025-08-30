-- CreateTable
CREATE TABLE "Partida" (
    "id" SERIAL NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modalidadeId" INTEGER NOT NULL,
    "timeAId" INTEGER NOT NULL,
    "timeBId" INTEGER NOT NULL,
    "pontosTimeA" INTEGER NOT NULL DEFAULT 0,
    "pontosTimeB" INTEGER NOT NULL DEFAULT 0,
    "tempoSegundos" INTEGER NOT NULL DEFAULT 0,
    "partidaIniciada" BOOLEAN NOT NULL DEFAULT false,
    "finalizada" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partida_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_modalidadeId_fkey" FOREIGN KEY ("modalidadeId") REFERENCES "Modalidade"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_timeAId_fkey" FOREIGN KEY ("timeAId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_timeBId_fkey" FOREIGN KEY ("timeBId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
