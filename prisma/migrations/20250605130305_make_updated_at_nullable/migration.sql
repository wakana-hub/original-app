/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "post" DROP COLUMN "updatedAt",
ADD COLUMN     "updated_at" TIMESTAMP(3);
