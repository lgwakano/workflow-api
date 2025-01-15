import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";

// Controller method to get all questions for a specific job using JobQuestionTemplate
const getQuestionsForJob = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
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

    // Extract and return the list of questions (from the `question` relation)
    const questions = jobQuestions.map((jobQuestion) => jobQuestion.question);

    return res.status(200).json(questions);
  } catch (error) {
    console.error('Error in getQuestionsForJob:', error);
    next(new Error('Failed to fetch questions. Please try again.'));
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// You can add other methods here, such as:
// - createQuestionTemplate
// - updateQuestionTemplate
// - deleteQuestionTemplate

export { getQuestionsForJob };
