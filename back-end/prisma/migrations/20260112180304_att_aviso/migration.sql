-- DropForeignKey
ALTER TABLE "Aviso" DROP CONSTRAINT "Aviso_quadraId_fkey";

-- AlterTable
ALTER TABLE "Aviso" ALTER COLUMN "quadraId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "Quadra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
