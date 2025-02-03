-- CreateTable
CREATE TABLE "Worker" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "dbd" TIMESTAMP(3),
    "workerAssignmentId" INTEGER NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkerAssignment" (
    "id" SERIAL NOT NULL,
    "position" TEXT NOT NULL,
    "numberOfWorkers" INTEGER NOT NULL,
    "jobQuestionTemplateId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerAssignment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "WorkerAssignment" ADD CONSTRAINT "WorkerAssignment_jobQuestionTemplateId_fkey" FOREIGN KEY ("jobQuestionTemplateId") REFERENCES "JobQuestionTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
