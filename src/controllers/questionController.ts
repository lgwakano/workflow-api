import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/prisma';

// Helper function to validate IDs
const validateId = (id: string): number | null => {
  const parsedId = parseInt(id, 10);
  return isNaN(parsedId) ? null : parsedId;
};

// Error handler middleware for centralized error management
const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  return res.status(status).json({ error: message }); // Ensure response is returned
};

// Get all questions
const getAllQuestions = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  try {
    const questions = await prisma.question.findMany({
      include: {
        options: { select: { id: true, text: true } }, // Fetch options if needed
      },
    });
    return res.json(questions); // Return response here
  } catch (error) {
    next(new Error('Failed to retrieve questions.'));
    return res.status(500).json({ error: 'Internal server error' }); // Return response after passing to error handler
  }
};

// Get question by ID
const getQuestionById = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const id = validateId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid question ID' });

  const includeAnswers = req.query.includeAnswers === 'true'; // Check for query parameter

  try {
    const question = await prisma.question.findUnique({
      where: { id },
      include: {
        options: { select: { id: true, text: true } },
        // Conditionally include answers if requested
        answers: includeAnswers ? { select: { id: true, answer: true } } : undefined,
      },
    });

    if (!question) return res.status(404).json({ error: 'Question not found' });

    return res.json(question); // Return response here
  } catch (error) {
    next(new Error(`Failed to retrieve question with ID ${id}.`));
    return res.status(500).json({ error: 'Internal server error' }); // Return response after passing to error handler
  }
};

// Create a new question
const createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const { type, text, options } = req.body;

  if (!text || !type) {
    return res.status(400).json({ error: 'Question text and type are required' });
  }

  try {
    const newQuestion = await prisma.question.create({
      data: {
        text,
        type,
        options: {
          create: options ? options.map((option: string) => ({ text: option })) : [],
        },
      },
    });

    return res.status(201).json(newQuestion); // Return response here
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
        return res.status(400).json({ error: 'Validation error in creating question' });
      }
    next(new Error('Failed to create question.'));
    return res.status(500).json({ error: 'Internal server error' }); // Return response after passing to error handler
  }
};

// Update an existing question
const updateQuestion = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const id = validateId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid question ID' });

  const { text, type, options } = req.body;

  try {
    const updatedQuestion = await prisma.question.update({
      where: { id },
      data: {
        text,
        type,
        options: {
          deleteMany: {}, // Remove old options before adding new ones
          create: options ? options.map((option: string) => ({ text: option })) : [],
        },
      },
    });

    return res.json(updatedQuestion); // Return response here
  } catch (error) {
    if (error instanceof Error && error.message.includes('Invalid')) {
        return res.status(400).json({ error: 'Validation error in updating question' });
    }
    next(new Error(`Failed to update question with ID ${id}.`));
    return res.status(500).json({ error: 'Internal server error' }); // Return response after passing to error handler
  }
};

// Delete a question
const deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
  const id = validateId(req.params.id);
  if (!id) return res.status(400).json({ error: 'Invalid question ID' });

  try {
    await prisma.question.delete({
      where: { id },
    });

    return res.status(204).send(); // Return response here
  } catch (error) {
    next(new Error(`Failed to delete question with ID ${id}.`));
    return res.status(500).json({ error: 'Internal server error' }); // Return response after passing to error handler
  }
};

export { getAllQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion, errorHandler };
