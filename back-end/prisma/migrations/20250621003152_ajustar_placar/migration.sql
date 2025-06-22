-- DropIndex
DROP INDEX "Placar_time_key";

-- AlterTable
ALTER TABLE "Placar" ALTER COLUMN "time" DROP NOT NULL;
