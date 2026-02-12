-- AlterTable
ALTER TABLE "CampeonatoTime" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "TreinadorTime" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "UsuarioTime" ADD COLUMN     "deletedAt" TIMESTAMP(3);
