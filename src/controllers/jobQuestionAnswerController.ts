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
  const answerId = validateId(req.params.answerId);
  if (!jobId) return res.status(400).json({ error: "Invalid Job ID" });
  if (!answerId) return res.status(400).json({ error: "Invalid answer ID" });

  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ error: "Answer field is required" });
  }

  try {
    const updatedAnswer = await prisma.jobQuestionAnswer.update({
      where: { id: answerId },
      data: { answer },
    });

    return res.json(updatedAnswer);
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to update Job Answer for Answer ID ${answerId}.`, record: "job answer" },
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
  const id = validateId(req.params.jobId);
  if (!id) return res.status(400).json({ error: "Invalid answer ID" });

  try {
    const deletedAnswer = await prisma.jobQuestionAnswer.delete({
      where: { id },
    });

    return res.json({
      message: `Answer with ID ${id} has been deleted.`,
      deletedAnswer,
    });
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to delete Job Answer for Job ID ${id}.`, record: "job answer" },
      next
    );
  }
};

export { getAnswersForJob, createAnswer, updateAnswer, deleteAnswer };
