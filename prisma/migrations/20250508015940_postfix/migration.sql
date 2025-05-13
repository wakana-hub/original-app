/*
  Warnings:

  - Added the required column `message` to the `post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "post" ADD COLUMN     "message" TEXT NOT NULL;
