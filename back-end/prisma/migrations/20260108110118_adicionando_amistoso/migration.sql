/*
  Warnings:

  - The values [PARTIDA] on the enum `TipoAgendamento` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoAgendamento_new" AS ENUM ('AMISTOSO', 'TREINO', 'EVENTO', 'OUTRO');
ALTER TABLE "Agendamento" ALTER COLUMN "tipo" DROP DEFAULT;
ALTER TABLE "Agendamento" ALTER COLUMN "tipo" TYPE "TipoAgendamento_new" USING ("tipo"::text::"TipoAgendamento_new");
ALTER TYPE "TipoAgendamento" RENAME TO "TipoAgendamento_old";
ALTER TYPE "TipoAgendamento_new" RENAME TO "TipoAgendamento";
DROP TYPE "TipoAgendamento_old";
ALTER TABLE "Agendamento" ALTER COLUMN "tipo" SET DEFAULT 'TREINO';
COMMIT;
