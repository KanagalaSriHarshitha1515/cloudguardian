import { Router } from "express";
import * as dockerHostController from "../controllers/dockerHost.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireProjectAccess } from "../middleware/authorization.middleware.js";

const router = Router();

// Mounted at /api/docker-hosts in app.js, so these become:
//   POST   /api/docker-hosts/:projectId
//   GET    /api/docker-hosts/:projectId
//   DELETE /api/docker-hosts/:projectId
// (flat, resource-first — matching the convention your other route files
// already use, rather than nesting under /api/projects)

/**
 * @swagger
 * /docker-hosts/{projectId}:
 *   post:
 *     summary: Connect a Docker Host to a project
 *     tags: [Docker Host]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: [tcp, tcp-tls, ssh, socket] }
 *               host: { type: string }
 *               port: { type: string }
 *               caCert: { type: string }
 *               clientCert: { type: string }
 *               clientKey: { type: string }
 *               socketPath: { type: string }
 *     responses:
 *       201:
 *         description: Successfully connected
 *       400:
 *         description: Missing or invalid fields
 *       502:
 *         description: Could not reach the Docker Engine
 */
router.post("/:projectId", authenticate, requireProjectAccess("projectId"), dockerHostController.connect);

/**
 * @swagger
 * /docker-hosts/{projectId}:
 *   get:
 *     summary: Get the connected Docker Host status for a project
 *     tags: [Docker Host]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Currently connected host
 *       404:
 *         description: No host connected yet (expected/normal state)
 */
router.get("/:projectId", authenticate, requireProjectAccess("projectId"), dockerHostController.getStatus);

/**
 * @swagger
 * /docker-hosts/{projectId}:
 *   delete:
 *     summary: Disconnect the Docker Host from a project
 *     tags: [Docker Host]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Disconnected
 */
router.delete("/:projectId", authenticate, requireProjectAccess("projectId"), dockerHostController.disconnect);

export default router;