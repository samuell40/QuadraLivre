-- CreateTable
CREATE TABLE "SetPartida" (
    "id" SERIAL NOT NULL,
    "partidaId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "pontosA" INTEGER NOT NULL,
    "pontosB" INTEGER NOT NULL,

    CONSTRAINT "SetPartida_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SetPartida_partidaId_numero_key" ON "SetPartida"("partidaId", "numero");

-- AddForeignKey
ALTER TABLE "SetPartida" ADD CONSTRAINT "SetPartida_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida"("id") ON DELETE CASCADE ON UPDATE CASCADE;
