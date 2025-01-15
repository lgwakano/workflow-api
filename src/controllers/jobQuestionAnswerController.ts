import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import { validateId } from "../utils/validation";

// Get answers for a specific job
const getAnswersForJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
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
    console.error(`Error in getAnswersForJob for job ID ${jobId}:`, error);
    next(new Error(`Failed to retrieve answers for job ID ${jobId}.`));
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Create an answer for a specific job-question pair
const createAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { jobId } = req.params; // Get jobId from URL parameters

  const { questionId, answer } = req.body;

  if (!jobId || !questionId || !answer) {
    return res
      .status(400)
      .json({ error: "Missing required fields: jobId, questionId, answer" });
  }

  try {
    const newAnswer = await prisma.jobQuestionAnswer.create({
      data: {
        jobId: Number(jobId),
        questionId,
        answer,
      },
    });

    return res.status(201).json(newAnswer);
  } catch (error) {
    console.error("Error in createAnswer:", error);
    next(new Error("Failed to create answer. Please verify the input data."));
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update an answer for a specific job-question pair
const updateAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = validateId(req.params.jobId);
  if (!id) return res.status(400).json({ error: "Invalid answer ID" });

  const { answer } = req.body;

  if (!answer) {
    return res.status(400).json({ error: "Answer field is required" });
  }

  try {
    const updatedAnswer = await prisma.jobQuestionAnswer.update({
      where: { id },
      data: { answer },
    });

    return res.json(updatedAnswer);
  } catch (error) {
    console.error(`Error in updateAnswer for ID ${id}:`, error);
    next(new Error(`Failed to update answer with ID ${id}.`));
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete an answer for a specific job-question pair
const deleteAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
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
    console.error(`Error in deleteAnswer for ID ${id}:`, error);
    next(new Error(`Failed to delete answer with ID ${id}.`));
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { getAnswersForJob, createAnswer, updateAnswer, deleteAnswer };
