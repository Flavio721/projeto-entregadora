-- AlterTable
ALTER TABLE "User" ADD COLUMN     "carroId" INTEGER;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_carroId_fkey" FOREIGN KEY ("carroId") REFERENCES "Veiculo"("id") ON DELETE CASCADE ON UPDATE CASCADE;
