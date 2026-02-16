-- AlterTable
ALTER TABLE "Campeonato" ADD COLUMN     "ordemClassificacao" JSONB;

-- AlterTable
ALTER TABLE "Placar" ADD COLUMN     "aproveitamento" INTEGER NOT NULL DEFAULT 0;
