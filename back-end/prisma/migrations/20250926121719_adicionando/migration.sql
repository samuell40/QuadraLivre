/*
  Warnings:

  - You are about to drop the column `funcao` on the `Jogador` table. All the data in the column will be lost.
  - You are about to drop the column `funcao` on the `PartidaUsuario` table. All the data in the column will be lost.
  - Added the required column `permissaoId` to the `PartidaUsuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Jogador" DROP COLUMN "funcao",
ADD COLUMN     "funcaoId" INTEGER;

-- AlterTable
ALTER TABLE "Partida" ADD COLUMN     "quadraId" INTEGER;

-- AlterTable
ALTER TABLE "PartidaUsuario" DROP COLUMN "funcao",
ADD COLUMN     "permissaoId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "FuncaoJogador" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "FuncaoJogador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Partida" ADD CONSTRAINT "Partida_quadraId_fkey" FOREIGN KEY ("quadraId") REFERENCES "Quadra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Jogador" ADD CONSTRAINT "Jogador_funcaoId_fkey" FOREIGN KEY ("funcaoId") REFERENCES "FuncaoJogador"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PartidaUsuario" ADD CONSTRAINT "PartidaUsuario_permissaoId_fkey" FOREIGN KEY ("permissaoId") REFERENCES "Permissao"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
