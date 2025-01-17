import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import handlePrismaError from "../utils/errorHandling";

// Controller method to get all questions for a specific job using JobQuestionTemplate
const getQuestionsForJob = async (req: Request, res: Response, next: NextFunction): Promise<Response | undefined> => {
  const { jobId } = req.params;

  if (!jobId) {
    return res.status(400).json({ error: 'Missing jobId in request' });
  }

  try {
    // Fetch all JobQuestionTemplate entries related to the jobId
    const jobQuestions = await prisma.jobQuestionTemplate.findMany({
      where: {
        jobId: Number(jobId),  // Ensure jobId is a number
      },
      include: {
        question: true,  // Include the associated question data
      },
    });
    console.log(jobQuestions);
    // Extract and return the list of questions (from the `question` relation)
    const questions = jobQuestions.map((jobQuestion) => jobQuestion.question);

    return res.status(200).json(questions);
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed to fetch Job Questions.", record: "job question template" },
      next
    );
  }
};

import { validate as validateUUID } from 'uuid';

const getQuestionsForJobByUUID = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { jobUuid } = req.params; // Extract jobUuid from params

  // Validate jobUuid as a UUID
  if (!jobUuid || !validateUUID(jobUuid)) {
    return res.status(400).json({ error: 'Invalid or missing jobUuid in request' });
  }

  try {
    // Fetch the job by its UUID
    const job = await prisma.job.findUnique({
      where: {
        uuid: jobUuid, // Match by UUID
      },
      select: {
        id: true, // Only fetch the job ID
      },
    });

    // If no job is found, return an error
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Fetch the JobQuestionTemplates associated with the job ID
    const jobQuestions = await prisma.jobQuestionTemplate.findMany({
      where: {
        jobId: job.id, // Use the retrieved job ID
      },
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    });

    // Extract and return the list of questions
    //const questions = jobQuestions.map((jobQuestion) => jobQuestion.question);

    // Preprocess to convert options into a simpler array of strings
    const questions = jobQuestions.map((jobQuestion) => {
      const question = jobQuestion.question;
      return {
        id: question.id,
        type: question.type,
        text: question.text,
        options: question.options.map((option) => option.text), // Extract only the text field
      };
    });

    return res.status(200).json(questions);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to fetch Job Questions by uuid ${jobUuid}.`, record: 'job question template' },
      next
    );
  }
};


// You can add other methods here, such as:
// - createQuestionTemplate
// - updateQuestionTemplate
// - deleteQuestionTemplate

export { getQuestionsForJob, getQuestionsForJobByUUID };
