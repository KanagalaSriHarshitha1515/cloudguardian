import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    initializeSwarm,
    inspectSwarm,
    leaveSwarm,
    listSwarmNodes
} from "../controllers/swarm.controller.js";
const router = express.Router();

router.post(
    "/:dockerHostId/init",
    authenticate,
    initializeSwarm
);
router.get(
    "/:dockerHostId",
    authenticate,
    inspectSwarm
);
router.post(
    "/:dockerHostId/leave",
    authenticate,
    leaveSwarm
);
router.get(
    "/:dockerHostId/nodes",
    authenticate,
    listSwarmNodes
);
export default router;