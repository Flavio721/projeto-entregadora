/*
  Warnings:

  - Added the required column `delivered_date` to the `Pedido` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Pedido" ADD COLUMN     "delivered_date" TIMESTAMP(3) NOT NULL;
