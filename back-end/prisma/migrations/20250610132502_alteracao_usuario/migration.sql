/*
  Warnings:

  - You are about to drop the column `nome` on the `Permissao` table. All the data in the column will be lost.
  - You are about to drop the column `senha` on the `Usuario` table. All the data in the column will be lost.
  - Added the required column `descricao` to the `Permissao` table without a default value. This is not possible if the table is not empty.
  - Added the required column `funcao` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Permissao" DROP COLUMN "nome",
ADD COLUMN     "descricao" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "senha",
ADD COLUMN     "funcao" TEXT NOT NULL,
ADD COLUMN     "telefone" TEXT;
