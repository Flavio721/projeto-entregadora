-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "user_status" "Status" NOT NULL DEFAULT 'ACTIVE';
