-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'OPERATOR', 'DELIVERY_MAN');

-- CreateEnum
CREATE TYPE "Delivery" AS ENUM ('CREATED', 'IN_SEPARATION', 'IN_DELIVERY', 'DELIVERED');

-- CreateEnum
CREATE TYPE "Vehicle" AS ENUM ('UNAVALIABLE', 'AVALIABLE');

-- CreateEnum
CREATE TYPE "DeliveryManStatus" AS ENUM ('UNAVALIABLE', 'AVALIABLE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "cpf" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'DELIVERY_MAN',
    "status" "DeliveryManStatus" NOT NULL DEFAULT 'AVALIABLE',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedido" (
    "id" SERIAL NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimated_date" TIMESTAMP(3) NOT NULL,
    "address" TEXT,
    "peso" DOUBLE PRECISION NOT NULL,
    "status" "Delivery" NOT NULL DEFAULT 'CREATED',
    "created_by" INTEGER NOT NULL,
    "administered_by" INTEGER,
    "catched_by" INTEGER,
    "carroId" INTEGER,

    CONSTRAINT "Pedido_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Veiculo" (
    "id" SERIAL NOT NULL,
    "crv" INTEGER NOT NULL,
    "marca" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "status" "Vehicle" NOT NULL DEFAULT 'AVALIABLE',

    CONSTRAINT "Veiculo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_administered_by_fkey" FOREIGN KEY ("administered_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_catched_by_fkey" FOREIGN KEY ("catched_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedido" ADD CONSTRAINT "Pedido_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
