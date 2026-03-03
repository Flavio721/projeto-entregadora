/*
  Warnings:

  - Changed the type of `tipo` on the `Veiculo` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "TypeVehicle" AS ENUM ('CAR', 'TRUCK', 'MOTOCYCLE');

-- AlterTable
ALTER TABLE "Veiculo" DROP COLUMN "tipo",
ADD COLUMN     "tipo" "TypeVehicle" NOT NULL;
