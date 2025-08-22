-- CreateEnum
CREATE TYPE "TipoAgendamento" AS ENUM ('PARTIDA', 'TREINO', 'EVENTO', 'OUTRO');

-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "duracao" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "tipo" "TipoAgendamento" NOT NULL DEFAULT 'TREINO';
