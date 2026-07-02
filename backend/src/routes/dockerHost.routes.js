import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  createDockerHost,
  testDockerConnection,
} from "../controllers/dockerHost.controller.js";

const router = Router();

router.post("/", authenticate, createDockerHost);

router.get(
  "/:id/test",
  authenticate,
  testDockerConnection
);

export default router;