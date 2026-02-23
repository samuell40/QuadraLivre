-- AlterTable
ALTER TABLE "Partida"
ADD COLUMN "ultimaEdicaoEm" TIMESTAMP(3),
ADD COLUMN "usuarioUltimaEdicaoId" INTEGER;

-- AddForeignKey
ALTER TABLE "Partida"
ADD CONSTRAINT "Partida_usuarioUltimaEdicaoId_fkey"
FOREIGN KEY ("usuarioUltimaEdicaoId")
REFERENCES "Usuario"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;
