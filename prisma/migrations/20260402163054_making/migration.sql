/*
  Warnings:

  - You are about to drop the column `deletedAt` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `User` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "AuditAction" ADD VALUE 'RESTORE';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "deletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "deletedAt",
ADD COLUMN     "isDeleted" BOOLEAN NOT NULL DEFAULT false;
