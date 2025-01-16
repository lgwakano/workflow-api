import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import handlePrismaError from "../utils/errorHandling";
import { v4 as uuidv4 } from "uuid";

// Utility function for validating ID
const validateId = (id: string): number | null => {
  const parsedId = Number(id);
  return isNaN(parsedId) ? null : parsedId;
};

const paginateJobs = async (page: number, pageSize: number) => {
  return prisma.job.findMany({
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      customer: { select: { id: true, name: true } }, // Only fetch necessary customer details
    },
    orderBy: { createdAt: "desc" }, // Order by latest jobs
  });
};

const getPaginationMetadata = async (pageSize: number) => {
  const totalJobs = await prisma.job.count(); // Fetch total jobs count
  const totalPages = Math.ceil(totalJobs / pageSize); // Calculate total pages
  return {
    totalJobs,
    totalPages,
  };
};

const getAllJobsNoPagination = async () => {
  return prisma.job.findMany({
    include: {
      customer: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" }, // Order by latest jobs
  });
};

// Get all jobs with pagination
const getAllJobs = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    //return await getPaginateJobs();
    return await getNoPaginateJobs();
  } catch (error) {
    console.error("Error in getAllJobs:", error);
    next(new Error("Failed to retrieve jobs. Please try again later."));
    return res.status(500).json({ error: "Internal server error" });
  }

  async function getNoPaginateJobs(){
    const jobs = await getAllJobsNoPagination();
    return res.json(jobs);
  }

  async function getPaginateJobs() {
    const page = parseInt(req.query.page as string, 10) || 1;
    const pageSize = parseInt(req.query.pageSize as string, 10) || 10;

    // Fetch jobs with pagination
    const jobs = await paginateJobs(page, pageSize);

    // Get pagination metadata
    const { totalJobs, totalPages } = await getPaginationMetadata(pageSize);

    return res.json({
      data: jobs,
      meta: {
        currentPage: page,
        pageSize,
        totalJobs,
        totalPages,
      },
    });
  }
};

// Get job by ID
const getJobById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = validateId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid job ID" });

  const includeQuestions = req.query.includeQuestions === "true"; // Check for query parameter

  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true } },
        // Conditionally include questionTemplates if requested
        questionTemplates: includeQuestions
          ? { select: { id: true, question: { select: { text: true } } } }
          : false,
      },
    });

    if (!job) return res.status(404).json({ error: "Job not found" });

    return res.json(job);
  } catch (error) {
    console.error(`Error in getJobById for id ${id}:`, error);
    next(new Error(`Failed to retrieve job with ID ${id}.`));
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  try {
    const { questionTemplateIds, ...jobData } = req.body;

    const newJob = await prisma.job.create({
      data: {
        ...jobData, // Using spread to add the job data
        uuid: uuidv4(),
        questionTemplates: {
          connect: Array.isArray(questionTemplateIds)
            ? questionTemplateIds.map((id: number) => ({ questionId: id })) // Ensure questionId is connected correctly
            : [],
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        questionTemplates: {
          select: {
            questionId: true, // Only return questionId (no title or answers)
          },
        },
      },
    });

    return res.status(201).json(newJob);
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed to create job.", record: "job" },
      next
    );
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Update an existing job using spread
const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const { id } = req.params;
  const { questionTemplateIds, ...jobData } = req.body;

  try {
    const updatedJob = await prisma.job.update({
      where: { id: Number(id) },
      data: {
        ...jobData, // Using spread to update the job data
        questionTemplates: {
          deleteMany: {}, // Remove existing relationships
          connect: Array.isArray(questionTemplateIds)
            ? questionTemplateIds.map((id: number) => ({ questionId: id })) // Ensure questionId is connected correctly
            : [],
        },
      },
      include: {
        customer: { select: { id: true, name: true } },
        questionTemplates: {
          select: {
            questionId: true, // Only return questionId (no title or answers)
          },
        },
      },
    });

    return res.json(updatedJob);
  } catch (error) {
    console.error("Error in updateJob:", error);
    next(new Error("Failed to update job. Please verify the input data."));
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete a job
const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response> => {
  const id = validateId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid job ID" });

  try {
    await prisma.job.delete({ where: { id } });
    return res.json({ message: "Job deleted successfully" });
  } catch (error) {
    console.error("Error in deleteJob:", error);
    next(new Error("Failed to delete job. Please try again later."));
    return res.status(500).json({ error: "Internal server error" });
  }
};

export { getAllJobs, getJobById, createJob, updateJob, deleteJob };
