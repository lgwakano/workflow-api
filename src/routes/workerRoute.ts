import { Router } from "express";
import {
  getWorkers,
  getWorkerById,
  createWorker,
  updateWorker,
  deleteWorker,
} from "../controllers/workerController";

const router = Router();

// Get all workers or filter by workerAssignmentId via query parameter
router.get("/assignment/:workerAssignmentId", getWorkers);

// Get a single worker by ID
router.get("/:id", getWorkerById);

// Create a new worker (must include workerAssignmentId in the body)
router.post("/", createWorker);

// Update an existing worker by ID
router.put("/:id", updateWorker);

// Delete a worker by ID
router.delete("/:id", deleteWorker);

export default router;
