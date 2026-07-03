import express from "express";
import {
  listServices,
  getService,
  createService,
  scaleService,
  deleteService,
} from "../controllers/service.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/:projectId", listServices);
router.get("/:projectId/:serviceId", getService);
router.post("/:projectId", createService);

router.patch("/:serviceId/scale", scaleService);

router.delete("/:serviceId", deleteService);

export default router;