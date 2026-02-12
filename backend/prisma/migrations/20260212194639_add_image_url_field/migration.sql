/*
  Warnings:

  - A unique constraint covering the columns `[crv]` on the table `Veiculo` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `imageUrl` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "imageUrl" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Veiculo_crv_key" ON "Veiculo"("crv");
