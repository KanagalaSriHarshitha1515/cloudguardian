import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  createDockerHost,
  testDockerConnection,
  getDockerHosts,
} from "../controllers/dockerHost.controller.js";

const router = Router();

router.use(authenticate);

// List Docker Hosts
router.get("/", getDockerHosts);

// Create Docker Host
router.post("/", createDockerHost);

// Test Docker Host
router.get("/:id/test", testDockerConnection);

export default router;