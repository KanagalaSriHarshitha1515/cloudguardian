import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  getContainers,
  startContainer,
  stopContainer,
  restartContainer,
  deleteContainer,
  getContainerLogs,
  getContainerStats,
  createContainer
} from "../controllers/container.controller.js";
const router = Router();

router.get(
  "/:dockerHostId",
  authenticate,
  getContainers
);
router.get(
  "/:dockerHostId/:containerId/logs",
  authenticate,
  getContainerLogs
);
router.get(
  "/:dockerHostId/:containerId/stats",
  authenticate,
  getContainerStats
);
router.post(
  "/:dockerHostId",
  authenticate,
  createContainer
);
router.post(
  "/:dockerHostId/:containerId/start",
  authenticate,
  startContainer
);
router.post(
  "/:dockerHostId/:containerId/stop",
  authenticate,
  stopContainer
);
router.post(
  "/:dockerHostId/:containerId/restart",
  authenticate,
  restartContainer
);
router.delete(
    "/:dockerHostId/:containerId",
    authenticate,
    deleteContainer
);

export default router;