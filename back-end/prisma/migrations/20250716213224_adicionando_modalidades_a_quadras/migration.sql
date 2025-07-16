-- CreateTable
CREATE TABLE "_QuadraModalidade" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_QuadraModalidade_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_QuadraModalidade_B_index" ON "_QuadraModalidade"("B");

-- AddForeignKey
ALTER TABLE "_QuadraModalidade" ADD CONSTRAINT "_QuadraModalidade_A_fkey" FOREIGN KEY ("A") REFERENCES "Modalidade"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_QuadraModalidade" ADD CONSTRAINT "_QuadraModalidade_B_fkey" FOREIGN KEY ("B") REFERENCES "Quadra"("id") ON DELETE CASCADE ON UPDATE CASCADE;
