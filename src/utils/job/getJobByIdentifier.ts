import { validate as validateUUID } from "uuid";
import prisma from "../../prisma/prisma";

// Helper function to fetch job based on UUID or jobId
export const getJobByIdentifier = async (jobIdentifier: string) => {
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
