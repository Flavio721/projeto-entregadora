/*
  Warnings:

  - Added the required column `frete` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "frete" DOUBLE PRECISION NOT NULL;
