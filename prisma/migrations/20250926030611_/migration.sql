/*
  Warnings:

  - You are about to drop the column `extractedText` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."File" DROP COLUMN "extractedText",
ADD COLUMN     "content" TEXT;
