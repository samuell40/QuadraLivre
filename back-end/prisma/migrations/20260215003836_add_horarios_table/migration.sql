-- CreateTable
CREATE TABLE "HorarioQuadra" (
    "id" SERIAL NOT NULL,
    "quadraId" INTEGER NOT NULL,
    "diaSemana" INTEGER NOT NULL,
    "horario" TEXT NOT NULL,

    CONSTRAINT "HorarioQuadra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "HorarioQuadra_quadraId_diaSemana_horario_key" ON "HorarioQuadra"("quadraId", "diaSemana", "horario");

-- AddForeignKey
ALTER TABLE "HorarioQuadra" ADD CONSTRAINT "HorarioQuadra_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "Quadra"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
