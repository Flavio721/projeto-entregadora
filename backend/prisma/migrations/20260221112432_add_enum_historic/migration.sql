-- CreateEnum
CREATE TYPE "Historic" AS ENUM ('CANCELLED', 'DELIVERED', 'RETURNED', 'OUT_OF_DATE');

-- AlterTable
ALTER TABLE "Historico" ADD COLUMN     "address" TEXT,
ADD COLUMN     "clientName" TEXT,
ADD COLUMN     "type" "Historic";
