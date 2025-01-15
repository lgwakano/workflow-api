/*
  Warnings:

  - You are about to drop the column `uuid` on the `Question` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Question_uuid_key";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "uuid";
