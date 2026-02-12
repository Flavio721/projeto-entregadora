/*
  Warnings:

  - Added the required column `clientCpf` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "clientCpf" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Historico" (
    "id" SERIAL NOT NULL,
    "note" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Historico_pkey" PRIMARY KEY ("id")
);
