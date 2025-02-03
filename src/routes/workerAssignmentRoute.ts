import express from "express";
import {
  getWorkerAssignments,
  getWorkerAssignmentById,
  createWorkerAssignment,
  updateWorkerAssignment,
  deleteWorkerAssignment,
} from "../controllers/workerAssignmentController";

const router = express.Router();

// Work Assignment Routes
router.get("/jobs/:jobId", getWorkerAssignments);
router.get("/:id", getWorkerAssignmentById);
router.post("/", createWorkerAssignment);
router.put("/:id", updateWorkerAssignment);
router.delete("/:id", deleteWorkerAssignment);

export default router;
