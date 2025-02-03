import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import handlePrismaError from "../utils/errorHandling";

const prisma = new PrismaClient();

const getWorkerAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    const take = Number(pageSize);
    const { jobId } = req.params;
    const parsedJobId = Number(jobId);


    if (isNaN(parsedJobId)) {
      return res.status(400).json({ error: "Invalid jobId provided." });
    }

    // Fetch worker assignments filtered by jobId
    const workerAssignments = await prisma.workerAssignment.findMany({
      where: { jobId: parsedJobId },
      skip,
      take,
      include:{
        workers: true
      }
    });

    const total = await prisma.workerAssignment.count({
      where: { jobId: parsedJobId }
    });

    //TODO: implement pagination with different response structure
    //res.json({ workerAssignments, total, page: Number(page), pageSize: Number(pageSize) });
    //console.log("API workerAssignments", workerAssignments);
    res.json(workerAssignments);
  } catch (error) {
    handlePrismaError(error, { message: "Failed to fetch worker assignments.", record: "worker assignment" }, next);
  }
};

const getWorkerAssignmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const workerAssignment = await prisma.workerAssignment.findUnique({ where: { id: Number(id) } });
    if (!workerAssignment) return res.status(404).json({ error: "Worker assignment not found." });
    res.json(workerAssignment);
  } catch (error) {
    handlePrismaError(error, { message: `Failed to fetch worker assignment by ID: ${req.params.id}.`, record: "worker assignment" }, next);
  }
};

const createWorkerAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { position, numberOfWorkers, jobId } = req.body;
    const newAssignment = await prisma.workerAssignment.create({
      data: { position, numberOfWorkers, jobId },
    });
    res.status(201).json(newAssignment);
  } catch (error) {
    handlePrismaError(error, { message: "Failed to create worker assignment.", record: "worker assignment" }, next);
  }
};

const updateWorkerAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    console.log("updateWorkerAssignment");
    const { id } = req.params; // Worker assignment ID
    const { position, numberOfWorkers, workers } = req.body; // Workers to update

    const updatedAssignment = await prisma.workerAssignment.update({
      where: { id: Number(id) }, // Finding the assignment by ID
      data: {
        position,
        numberOfWorkers,
        workers: {
          // Here we are only updating the existing workers
          update: workers.map((worker: any) => ({
            where: { id: worker.id }, // Make sure to update based on existing worker's id
            data: {
              name: worker.name,
              email: worker.email,
              phone: worker.phone,
              dbd: worker.dbd,
            },
          })),
        },
      },
      include: { workers: true }, // Return updated workers
    });

    res.json(updatedAssignment);
  } catch (error) {
    handlePrismaError(error, { message: `Failed to update worker assignment with ID: ${req.params.id}.`, record: "worker assignment" }, next);
  }
};

const deleteWorkerAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.workerAssignment.delete({ where: { id: Number(id) } });
    res.json({ message: "Worker assignment deleted successfully." });
  } catch (error) {
    handlePrismaError(error, { message: `Failed to delete worker assignment with ID: ${req.params.id}.`, record: "worker assignment" }, next);
  }
};

export {
  getWorkerAssignments,
  getWorkerAssignmentById,
  createWorkerAssignment,
  updateWorkerAssignment,
  deleteWorkerAssignment,
};
