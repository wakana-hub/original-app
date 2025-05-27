-- CreateEnum
CREATE TYPE "PostStatus" AS ENUM ('INCOMPLETE', 'COMPLETE');

-- AlterTable
ALTER TABLE "post" ADD COLUMN     "status" "PostStatus" NOT NULL DEFAULT 'INCOMPLETE';
