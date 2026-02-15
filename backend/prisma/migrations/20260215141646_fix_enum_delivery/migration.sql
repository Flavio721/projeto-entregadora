/*
  Warnings:

  - The values [IN_SEPARATION] on the enum `Delivery` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Delivery_new" AS ENUM ('CREATED', 'PENDING', 'IN_DELIVERY', 'DELIVERED');
ALTER TABLE "Pedido" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Pedido" ALTER COLUMN "status" TYPE "Delivery_new" USING ("status"::text::"Delivery_new");
ALTER TYPE "Delivery" RENAME TO "Delivery_old";
ALTER TYPE "Delivery_new" RENAME TO "Delivery";
DROP TYPE "Delivery_old";
ALTER TABLE "Pedido" ALTER COLUMN "status" SET DEFAULT 'CREATED';
COMMIT;
