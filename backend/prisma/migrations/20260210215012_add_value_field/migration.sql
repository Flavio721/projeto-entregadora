/*
  Warnings:

  - Added the required column `valor` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "valor" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "created_by" DROP NOT NULL;
