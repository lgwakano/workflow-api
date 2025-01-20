-- DropForeignKey
ALTER TABLE "JobQuestionAnswer" DROP CONSTRAINT "JobQuestionAnswer_jobId_fkey";

-- DropForeignKey
ALTER TABLE "JobQuestionAnswer" DROP CONSTRAINT "JobQuestionAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "JobQuestionTemplate" DROP CONSTRAINT "JobQuestionTemplate_jobId_fkey";

-- DropForeignKey
ALTER TABLE "JobQuestionTemplate" DROP CONSTRAINT "JobQuestionTemplate_questionId_fkey";

-- DropForeignKey
ALTER TABLE "Option" DROP CONSTRAINT "Option_questionId_fkey";

-- AddForeignKey
ALTER TABLE "JobQuestionTemplate" ADD CONSTRAINT "JobQuestionTemplate_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobQuestionTemplate" ADD CONSTRAINT "JobQuestionTemplate_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobQuestionAnswer" ADD CONSTRAINT "JobQuestionAnswer_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobQuestionAnswer" ADD CONSTRAINT "JobQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
