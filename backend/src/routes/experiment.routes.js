import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  listExperiments,
  createExperiment,
  updateExperimentStatus,
} from "../controllers/experiment.controller.js";

const router = Router();

router.use(authenticate);
router.get("/:projectId", listExperiments);
router.post("/:projectId", createExperiment);
router.patch("/:projectId/:experimentId/status", updateExperimentStatus);

export default router;
