import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import { validateId } from "../utils/validation";
import handlePrismaError from "../utils/errorHandling";

// Get answers for a specific job
const getAnswersForJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const jobId = validateId(req.params.jobId);
  if (!jobId) return res.status(400).json({ error: "Invalid job ID" });

  try {
    const answers = await prisma.jobQuestionAnswer.findMany({
      where: { jobId },
      select: {
        id: true,
        jobId: true,
        questionId: true,
        answer: true,
      },
    });

    return res.json(answers);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to fetch Job Answers for Job ID ${jobId}.`, record: "job answer" },
      next
    );
  }
};

// Create an answer for a specific job-question pair
const createAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { jobId } = req.params; // Get jobId from URL parameters

  const { questionId, answer } = req.body;

  if (!jobId || !questionId || !answer) {
    return res
      .status(400)
      .json({ error: "Missing required fields: jobId, questionId, answer" });
  }

   // Ensure answer is an array
   const answerArray = Array.isArray(answer) ? answer : [answer];

  try {
    const newAnswer = await prisma.jobQuestionAnswer.create({
      data: {
        jobId: Number(jobId),
        questionId,
        answer: answerArray,
      },
    });

    return res.status(201).json(newAnswer);
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed to create Job Answer.", record: "job answer" },
      next
    );
  }
};

// Update an answer for a specific job-question pair
const updateAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const jobId = validateId(req.params.jobId);
  const questionId = validateId(req.params.questionId);
  if (!jobId) return res.status(400).json({ error: "Invalid Job ID" });
  if (!questionId) return res.status(400).json({ error: "Invalid question ID" });

  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ error: "Answer field is required" });
  }

  try {
    const lastAnswer = await prisma.jobQuestionAnswer.findFirst({
      where: { jobId, questionId },
      orderBy: {
        id: 'desc',
      },
    });

    if (!lastAnswer) {
      return res.status(404).json({ error: "Answer not found" });
    }

    const updatedAnswer = await prisma.jobQuestionAnswer.update({
      where: { id: lastAnswer.id },
      data: { answer },
    });

    return res.json(updatedAnswer);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to update Job Answer for Question ID ${questionId}.`, record: "job answer" },
      next
    );
  }
};

// Delete an answer for a specific job-question pair
const deleteAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const jobId = validateId(req.params.jobId);
  const questionId = validateId(req.params.questionId);

  if (!jobId) return res.status(400).json({ error: "Invalid Job ID" });
  if (!questionId) return res.status(400).json({ error: "Invalid question ID" });

  try {
    // Fetch the most recent answer based on the createdAt timestamp or id
    const lastAnswer = await prisma.jobQuestionAnswer.findFirst({
      where: { jobId, questionId },
      orderBy: {
        id: 'desc',
      },
    });

    if (!lastAnswer) {
      return res.status(404).json({ error: "Answer not found or already deleted" });
    }

    // Delete the most recent answer
    const deletedAnswer = await prisma.jobQuestionAnswer.delete({
      where: { id: lastAnswer.id },
    });

    return res.json({
      message: `Answer with ID ${lastAnswer.id} has been deleted.`,
      deletedAnswer,
    });
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to delete Job Answer for Job ID ${jobId}.`, record: "job answer" },
      next
    );
  }
};

export { getAnswersForJob, createAnswer, updateAnswer, deleteAnswer };
