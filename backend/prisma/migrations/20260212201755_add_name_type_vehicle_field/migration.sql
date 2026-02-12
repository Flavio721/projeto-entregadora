/*
  Warnings:

  - Added the required column `nome` to the `Veiculo` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tipo_veiculo` to the `Veiculo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Veiculo" ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "tipo_veiculo" TEXT NOT NULL;
