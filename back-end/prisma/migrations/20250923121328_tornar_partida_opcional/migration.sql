-- DropForeignKey
ALTER TABLE "Jogador" DROP CONSTRAINT "Jogador_partidaId_fkey";

-- AlterTable
ALTER TABLE "Jogador" ALTER COLUMN "partidaId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Jogador" ADD CONSTRAINT "Jogador_partidaId_fkey" FOREIGN KEY ("partidaId") REFERENCES "Partida"("id") ON DELETE SET NULL ON UPDATE CASCADE;
