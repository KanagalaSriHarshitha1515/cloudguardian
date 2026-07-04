import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";

import {
  createDockerHost,
  testDockerConnection,
  getDockerHosts,
} from "../controllers/dockerHost.controller.js";
/**
 * @swagger
 * tags:
 *   name: Docker Hosts
 *   description: Docker Host Management APIs
 */
const router = Router();

router.use(authenticate);

// List Docker Hosts

/**
 * @swagger
 * /api/docker-hosts:
 *   get:
 *     summary: Get all Docker hosts
 *     description: Returns all Docker hosts belonging to the authenticated user.
 *     tags:
 *       - Docker Hosts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Docker hosts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 dockerHosts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       host:
 *                         type: string
 *                       port:
 *                         type: integer
 *                       description:
 *                         type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.get("/", getDockerHosts);

// Create Docker Host

/**
 * @swagger
 * /api/docker-hosts:
 *   post:
 *     summary: Create a Docker host
 *     tags:
 *       - Docker Hosts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - host
 *               - port
 *               - projectId
 *             properties:
 *               name:
 *                 type: string
 *                 example: Local Docker
 *               host:
 *                 type: string
 *                 example: localhost
 *               port:
 *                 type: integer
 *                 example: 2375
 *               description:
 *                 type: string
 *                 example: Local Docker Engine
 *               projectId:
 *                 type: string
 *                 example: a00ff9a9-8358-4438-9764-4f4dcfafddfb
 *     responses:
 *       201:
 *         description: Docker host created successfully
 *       404:
 *         description: Project not found
 */
router.post("/", createDockerHost);

// Test Docker Host

/**
 * @swagger
 * /api/docker-hosts/{id}/test:
 *   get:
 *     summary: Test Docker host connection
 *     tags:
 *       - Docker Hosts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Host ID
 *     responses:
 *       200:
 *         description: Docker connection successful
 *       404:
 *         description: Docker host not found
 */

router.get("/:id/test", testDockerConnection);

export default router;