import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
  initializeSwarm,
  inspectSwarm,
  leaveSwarm,
  listSwarmNodes,
} from "../controllers/swarm.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Swarm
 *   description: Docker Swarm Management APIs
 */

/**
 * @swagger
 * /api/swarm/{dockerHostId}/init:
 *   post:
 *     summary: Initialize Docker Swarm
 *     tags:
 *       - Swarm
 *     security:
 *       - bearerAuth: []
 */
router.post("/:dockerHostId/init", authenticate, initializeSwarm);

/**
 * @swagger
 * /api/swarm/{dockerHostId}:
 *   get:
 *     summary: Inspect Docker Swarm
 *     tags:
 *       - Swarm
 *     security:
 *       - bearerAuth: []
 */
router.get("/:dockerHostId", authenticate, inspectSwarm);

/**
 * @swagger
 * /api/swarm/{dockerHostId}/leave:
 *   post:
 *     summary: Leave Docker Swarm
 *     tags:
 *       - Swarm
 *     security:
 *       - bearerAuth: []
 */
router.post("/:dockerHostId/leave", authenticate, leaveSwarm);

/**
 * @swagger
 * /api/swarm/{dockerHostId}/nodes:
 *   get:
 *     summary: List Swarm Nodes
 *     tags:
 *       - Swarm
 *     security:
 *       - bearerAuth: []
 */
router.get("/:dockerHostId/nodes", authenticate, listSwarmNodes);

export default router;