CREATE TABLE "PushSubscription" (
  "id" SERIAL NOT NULL,
  "usuarioId" INTEGER NOT NULL,
  "endpoint" TEXT NOT NULL,
  "p256dh" TEXT NOT NULL,
  "auth" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PushSubscription_endpoint_key"
  ON "PushSubscription"("endpoint");

CREATE INDEX "PushSubscription_usuarioId_idx"
  ON "PushSubscription"("usuarioId");

ALTER TABLE "PushSubscription"
  ADD CONSTRAINT "PushSubscription_usuarioId_fkey"
  FOREIGN KEY ("usuarioId")
  REFERENCES "Usuario"("id")
  ON DELETE CASCADE
  ON UPDATE CASCADE;
