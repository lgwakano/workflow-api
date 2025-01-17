import express from "express";
import {
  getAllJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
} from "../controllers/jobController";
import {
  getAnswersForJob,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} from "../controllers/jobQuestionAnswerController";
import { getQuestionsForJob } from "../controllers/jobQuestionTemplateController";

const router = express.Router();

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.post("/", createJob);
router.put("/:id", updateJob);
router.delete("/:id", deleteJob);

router.get("/:jobId/answers", getAnswersForJob);
router.post("/:jobId/answers", createAnswer);
router.put("/:jobId/answers/:questionId", updateAnswer);
router.delete("/:jobId/answers/:questionId", deleteAnswer);

router.get("/:jobIdentifier/questions", getQuestionsForJob);

export default router;
