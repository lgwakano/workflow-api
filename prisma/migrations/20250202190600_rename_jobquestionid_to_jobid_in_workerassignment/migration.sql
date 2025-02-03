/*
  Warnings:

  - You are about to drop the column `jobQuestionTemplateId` on the `WorkerAssignment` table. All the data in the column will be lost.
  - Added the required column `jobId` to the `WorkerAssignment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "WorkerAssignment" DROP CONSTRAINT "WorkerAssignment_jobQuestionTemplateId_fkey";

-- AlterTable
ALTER TABLE "WorkerAssignment" DROP COLUMN "jobQuestionTemplateId",
ADD COLUMN     "jobId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_workerAssignmentId_fkey" FOREIGN KEY ("workerAssignmentId") REFERENCES "WorkerAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
