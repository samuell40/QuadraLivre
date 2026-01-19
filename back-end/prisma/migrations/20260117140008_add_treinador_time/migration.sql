-- CreateTable
CREATE TABLE "TreinadorTime" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "timeId" INTEGER NOT NULL,

    CONSTRAINT "TreinadorTime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TreinadorTime_timeId_key" ON "TreinadorTime"("timeId");

-- AddForeignKey
ALTER TABLE "TreinadorTime" ADD CONSTRAINT "TreinadorTime_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TreinadorTime" ADD CONSTRAINT "TreinadorTime_timeId_fkey" FOREIGN KEY ("timeId") REFERENCES "Time"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
