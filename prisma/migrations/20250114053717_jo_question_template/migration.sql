/*
  Warnings:

  - You are about to drop the column `jobId` on the `Question` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Question" DROP CONSTRAINT "Question_jobId_fkey";

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "jobId";

-- CreateTable
CREATE TABLE "JobQuestionTemplate" (
    "id" SERIAL NOT NULL,
    "jobId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "JobQuestionTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "JobQuestionTemplate" ADD CONSTRAINT "JobQuestionTemplate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobQuestionTemplate" ADD CONSTRAINT "JobQuestionTemplate_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
