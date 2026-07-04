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

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Docker Swarm Service Management APIs
 */

/**
 * @swagger
 * /api/services/{projectId}:
 *   get:
 *     summary: Get all services
 *     description: Retrieve all Docker services for a project.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 *       404:
 *         description: Project not found
 */
router.get("/:projectId", listServices);

/**
 * @swagger
 * /api/services/{projectId}/{serviceId}:
 *   get:
 *     summary: Get service details
 *     description: Retrieve details of a Docker service.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Service details retrieved successfully
 *       404:
 *         description: Service not found
 */
router.get("/:projectId/:serviceId", getService);

/**
 * @swagger
 * /api/services/{projectId}:
 *   post:
 *     summary: Create a Docker service
 *     description: Create a new Docker Swarm service.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - image
 *             properties:
 *               serviceName:
 *                 type: string
 *                 example: nginx-service
 *               image:
 *                 type: string
 *                 example: nginx:latest
 *               replicas:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Invalid request
 */
router.post("/:projectId", createService);

/**
 * @swagger
 * /api/services/{serviceId}/scale:
 *   patch:
 *     summary: Scale a Docker service
 *     description: Update the number of replicas for a service.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - replicas
 *             properties:
 *               replicas:
 *                 type: integer
 *                 example: 5
 *     responses:
 *       200:
 *         description: Service scaled successfully
 *       404:
 *         description: Service not found
 */

router.patch("/:projectId/:serviceId/scale", scaleService);


/**
 * @swagger
 * /api/services/{serviceId}:
 *   delete:
 *     summary: Delete a Docker service
 *     description: Remove a Docker Swarm service.
 *     tags:
 *       - Services
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: string
 *         description: Service ID
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
router.delete("/:projectId/:serviceId", deleteService);

export default router;