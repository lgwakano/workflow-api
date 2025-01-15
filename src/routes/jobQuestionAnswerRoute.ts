import { Router } from "express";
import {
  getAnswersForJob,
  createAnswer,
  updateAnswer,
  deleteAnswer,
} from "../controllers/jobQuestionAnswerController";

const router = Router();

router.get("/", getAnswersForJob);
router.post("/:jobId/answers", createAnswer);
router.put("/:jobId/answers/:answerId", updateAnswer);
router.delete("/:jobId/answers/:answerId", deleteAnswer);

export default router;
