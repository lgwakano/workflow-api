import { Request, Response, NextFunction } from "express";
import prisma from "../prisma/prisma";
import handlePrismaError from "../utils/errorHandling";
import { v4 as uuidv4, validate as validateUUID } from "uuid";

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
): Promise<Response | undefined> => {
  try {
    //return await getPaginateJobs();
    return await getNoPaginateJobs();
  } catch (error) {
    handlePrismaError(
      error,
      { message: "Failed to fetch all jobs.", record: "job" },
      next
    );
  }

  async function getNoPaginateJobs() {
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
): Promise<Response | undefined> => {
  const { id } = req.params;

  // Check if the id is a valid UUID
  const isUuidValid = validateUUID(id);
  let whereClause;

  if (isUuidValid) {
    whereClause = { uuid: id }; // If it's a valid UUID, query by uuid
  } else {
    // If it's not a UUID, validate it as a numeric job ID
    const validatedId = validateId(id);
    if (!validatedId) {
      return res.status(400).json({ error: "Invalid job ID" });
    }
    whereClause = { id: validatedId }; // If it's a valid numeric ID, query by id
  }

  const includeQuestions = req.query.includeQuestions === "true"; // Check for query parameter

  try {
    const job = await prisma.job.findUnique({
      where: whereClause,
      include: {
        customer: { select: { id: true, name: true } },
        questionTemplates: includeQuestions
          ? { select: { id: true, question: { select: { text: true } } } }
          : false,
      },
    });

    if (!job) return res.status(404).json({ error: "Job not found" });

    return res.json(job);
  } catch (error) {
    handlePrismaError(error, { message: `Failed to fetch job with id or uuid ${id}.`, record: "job" }, next);
  }
};

const createJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  try {
    const { deadline, ...jobData } = req.body; // Get the job data, excluding questionTemplateIds
    // Convert ISO string deadline to Date object if it's provided
    const formattedDeadline = deadline ? new Date(deadline) : null;
    // 1. Create the job without the questionTemplates connection
    const newJob = await prisma.job.create({
      data: {
        ...jobData, // Other job data
        uuid: uuidv4(),
        deadline: formattedDeadline,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        },
      },
    });

    // 2. Fetch all question templates from the database
    const allQuestions = await prisma.question.findMany();

    // 3. Map the question IDs to associate them with the job
    const jobQuestionTemplates = allQuestions.map((question) => ({
      jobId: newJob.id, // Link the new job's ID
      questionId: question.id, // Use the question ID from the database
    }));

    // 4. Bulk create the JobQuestionTemplate records
    await prisma.jobQuestionTemplate.createMany({
      data: jobQuestionTemplates,
    });

    // 5. Return the newly created job without the associated questions
    return res.status(201).json(newJob); // Only return the job's basic details
  } catch (error) {
    handlePrismaError(error, { message: "Failed to create job.", record: "job" }, next);
  }
};


// Update an existing job using spread
const updateJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const { id } = req.params;
  const { name, deadline, description, customerId } = req.body; // Remove questionTemplateIds

  try {
    const updatedJob = await prisma.job.update({
      where: { id: Number(id) },
      data: {
        name, // Only update the fields that can be updated
        deadline,
        description,
        customerId,
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
    handlePrismaError(
      error,
      { message: `Failed to update job with id ${id}.`, record: "job" },
      next
    );
  }
};

// Delete a job
const deleteJob = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | undefined> => {
  const id = validateId(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid job ID" });

  try {
    await prisma.job.delete({ where: { id } });
    return res.json({ message: "Job deleted successfully" });
  } catch (error) {
    handlePrismaError(
      error,
      { message: `Failed to delete job with id ${id}.`, record: "job" },
      next
    );
  }
};

export { getAllJobs, getJobById, createJob, updateJob, deleteJob };
