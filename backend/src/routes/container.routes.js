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
/**
 * @swagger
 * tags:
 *   name: Containers
 *   description: Docker Container Management APIs
 */
/**
 * @swagger
 * /api/containers:
 *   get:
 *     summary: Get all Docker containers
 *     tags:
 *       - Containers
 *     responses:
 *       200:
 *         description: List of Docker containers
 */
/**
 * @swagger
 * /api/containers/{id}:
 *   get:
 *     summary: Get container details
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Container ID
 *     responses:
 *       200:
 *         description: Container details
 *       404:
 *         description: Container not found
 */
router.get(
  "/:dockerHostId",
  authenticate,
  getContainers
);
/**
 * @swagger
 * /api/containers/{id}/logs:
 *   get:
 *     summary: Get Docker container logs
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container logs
 */
router.get(
  "/:dockerHostId/:containerId/logs",
  authenticate,
  getContainerLogs
);
/**
 * @swagger
 * /api/containers/{id}/stats:
 *   get:
 *     summary: Get Docker container statistics
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Container statistics
 */
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
/**
 * @swagger
 * /api/containers/{id}/start:
 *   post:
 *     summary: Start a Docker container
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Container ID
 *     responses:
 *       200:
 *         description: Container started successfully
 *       404:
 *         description: Container not found
 */
router.post(
  "/:dockerHostId/:containerId/start",
  authenticate,
  startContainer
);
/**
 * @swagger
 * /api/containers/{id}/stop:
 *   post:
 *     summary: Stop a Docker container
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Container ID
 *     responses:
 *       200:
 *         description: Container stopped successfully
 */
router.post(
  "/:dockerHostId/:containerId/stop",
  authenticate,
  stopContainer
);
/**
 * @swagger
 * /api/containers/{id}/restart:
 *   post:
 *     summary: Restart a Docker container
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Container ID
 *     responses:
 *       200:
 *         description: Container restarted successfully
 */
router.post(
  "/:dockerHostId/:containerId/restart",
  authenticate,
  restartContainer
);
/**
 * @swagger
 * /api/containers/{id}:
 *   delete:
 *     summary: Delete a Docker container
 *     tags:
 *       - Containers
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Container ID
 *     responses:
 *       200:
 *         description: Container deleted successfully
 */
router.delete(
    "/:dockerHostId/:containerId",
    authenticate,
    deleteContainer
);

export default router;