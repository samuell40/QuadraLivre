-- CreateTable
CREATE TABLE "PartidaUsuario" (
    "id" SERIAL NOT NULL,
    "partidaId" INTEGER NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "funcao" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PartidaUsuario_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PartidaUsuario" ADD CONSTRAINT "PartidaUsuario_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartidaUsuario" ADD CONSTRAINT "PartidaUsuario_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
