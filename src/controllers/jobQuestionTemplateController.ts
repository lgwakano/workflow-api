import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import handlePrismaError from "../utils/errorHandling";
import { validate as validateUUID } from 'uuid';

// Helper function to fetch job based on UUID or jobId
const getJobByIdentifier = async (jobIdentifier: string) => {
  let job;
  if (validateUUID(jobIdentifier)) {
    // Fetch the job by its UUID
    job = await prisma.job.findUnique({
      where: {
        uuid: jobIdentifier,
      },
      select: {
        id: true, // Only fetch the job ID
      },
    });
  } else {
    // If it's not a valid UUID, assume it's a jobId (numeric)
    const jobId = parseInt(jobIdentifier);
    if (isNaN(jobId)) {
      throw new Error('Invalid Job ID format');
    }

    job = await prisma.job.findUnique({
      where: {
        id: jobId, // Use the jobId to fetch the job
      },
      select: {
        id: true, // Only fetch the job ID
      },
    });
  }
  return job;
};

// Helper function to fetch questions for a specific job
const getJobQuestions = async (jobId: number) => {
  const jobQuestions = await prisma.jobQuestionTemplate.findMany({
    where: {
      jobId, // Use the retrieved job ID
    },
    include: {
      question: {
        include: {
          options: true,
        },
      },
    },
  });

  // Preprocess the questions to simplify the structure
  return jobQuestions.map((jobQuestion) => {
    const question = jobQuestion.question;
    return {
      id: question.id,
      type: question.type,
      text: question.text,
      options: question.options.map((option) => option.text), // Extract only the text field
    };
  });
};

// Controller method to get all questions for a specific job
const getQuestionsForJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { jobIdentifier } = req.params; // Extract jobIdentifier from params (either jobId or jobUuid)

  if (!jobIdentifier) {
    return res.status(400).json({ error: 'Job identifier is required' });
  }

  try {
    // Fetch the job by identifier (either UUID or jobId)
    const job = await getJobByIdentifier(jobIdentifier);

    // If no job is found, return an error
    if (!job) {
      return res.status(404).json({ error: `Job with identifier ${jobIdentifier} not found` });
    }

    // Fetch the questions for the job
    const questions = await getJobQuestions(job.id);

    return res.status(200).json(questions);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to fetch Job Questions for identifier ${jobIdentifier}.`, record: 'job question template' },
      next
    );
  }
};

export { getQuestionsForJob };
