-- CreateEnum
CREATE TYPE "inquirytype" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "gender" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "relationship" AS ENUM ('SELF', 'FAMILY', 'OTHER');

-- CreateEnum
CREATE TYPE "category" AS ENUM ('PRODUCT', 'PURCHASE', 'APPLICATION', 'COMPLAINT', 'OTHER');

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "auth_id" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "auth_id" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3) NOT NULL,
    "inquiryType" "inquirytype" NOT NULL,
    "inquirerName" TEXT,
    "inquirerGender" "gender",
    "inquirerPhone" TEXT,
    "inquirerRelationship" "relationship",
    "inquirerRelationshipOther" TEXT,
    "category" "category" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "post_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_auth_id_key" ON "user"("auth_id");

-- AddForeignKey
ALTER TABLE "post" ADD CONSTRAINT "post_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
