import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import handlePrismaError from "../utils/errorHandling";

const prisma = new PrismaClient();

// Get all workers, with an optional filter for workerAssignmentId
const getWorkers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { workerAssignmentId } = req.query;
    let workers;
    if (workerAssignmentId) {
      workers = await prisma.worker.findMany({
        where: { workerAssignmentId: Number(workerAssignmentId) },
      });
    } else {
      workers = await prisma.worker.findMany();
    }
    res.json(workers);
  } catch (error) {
    handlePrismaError(error, { message: "Failed to fetch workers.", record: "worker" }, next);
  }
};

// Get a single worker by ID
const getWorkerById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const worker = await prisma.worker.findUnique({
      where: { id: Number(id) },
    });
    if (!worker) return res.status(404).json({ error: "Worker not found." });
    res.json(worker);
  } catch (error) {
    handlePrismaError(error, { message: `Failed to fetch worker with ID: ${req.params.id}.`, record: "worker" }, next);
  }
};

// Create a new worker. The request must include a workerAssignmentId.
const createWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, dbd, workerAssignmentId } = req.body;
    if (!workerAssignmentId) {
      return res.status(400).json({ error: "workerAssignmentId is required." });
    }
    const newWorker = await prisma.worker.create({
      data: {
        name,
        email,
        phone,
        dbd: dbd ? new Date(dbd) : null,
        workerAssignmentId: Number(workerAssignmentId),
      },
    });
    res.status(201).json(newWorker);
  } catch (error) {
    handlePrismaError(error, { message: "Failed to create worker.", record: "worker" }, next);
  }
};

// Update an existing worker
const updateWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, phone, dbd } = req.body;
    const updatedWorker = await prisma.worker.update({
      where: { id: Number(id) },
      data: {
        name,
        email,
        phone,
        dbd: dbd ? new Date(dbd) : null,
      },
    });
    res.json(updatedWorker);
  } catch (error) {
    handlePrismaError(error, { message: `Failed to update worker with ID: ${req.params.id}.`, record: "worker" }, next);
  }
};

// Delete a worker by ID
const deleteWorker = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.worker.delete({
      where: { id: Number(id) },
    });
    res.json({ message: "Worker deleted successfully." });
  } catch (error) {
    handlePrismaError(error, { message: `Failed to delete worker with ID: ${req.params.id}.`, record: "worker" }, next);
  }
};

export {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
};
