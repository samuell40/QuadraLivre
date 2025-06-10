-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_quadraId_fkey";

-- AlterTable
ALTER TABLE "Usuario" ALTER COLUMN "quadraId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "Quadra"("id") ON DELETE SET NULL ON UPDATE CASCADE;
