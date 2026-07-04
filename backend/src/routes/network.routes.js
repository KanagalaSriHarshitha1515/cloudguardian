import express from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import {
    getNetworks,
    inspectNetwork,
    createNetwork,
    deleteNetwork,
    connectContainer,
    disconnectContainer
} from "../controllers/network.controller.js";
const router = express.Router();
/**
 * @swagger
 * tags:
 *   name: Networks
 *   description: Docker Network Management APIs
 */
/**
 * @swagger
 * /api/networks/{dockerHostId}:
 *   get:
 *     summary: Get all Docker networks
 *     tags:
 *       - Networks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dockerHostId
 *         required: true
 *         schema:
 *           type: string
 *         description: Docker Host ID
 *     responses:
 *       200:
 *         description: List of Docker networks
 */
router.get(
    "/:dockerHostId",
    authenticate,
    getNetworks
);
/**
 * @swagger
 * /api/networks/{dockerHostId}/{networkId}:
 *   get:
 *     summary: Inspect a Docker network
 *     tags:
 *       - Networks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dockerHostId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: networkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Network details
 */
router.get(
    "/:dockerHostId/:networkId",
    authenticate,
    inspectNetwork
);
/**
 * @swagger
 * /api/networks/{dockerHostId}:
 *   post:
 *     summary: Create a Docker network
 *     tags:
 *       - Networks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dockerHostId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: backend-network
 *               driver:
 *                 type: string
 *                 example: bridge
 *     responses:
 *       201:
 *         description: Network created successfully
 */
router.post(
    "/:dockerHostId",
    authenticate,
    createNetwork
);
/**
 * @swagger
 * /api/networks/{dockerHostId}/{networkId}:
 *   delete:
 *     summary: Delete a Docker network
 *     tags:
 *       - Networks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dockerHostId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: networkId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Network deleted successfully
 */
router.delete(
    "/:dockerHostId/:networkId",
    authenticate,
    deleteNetwork
);
/**
 * @swagger
 * /api/networks/{dockerHostId}/{networkId}/connect:
 *   post:
 *     summary: Connect a container to a Docker network
 *     tags:
 *       - Networks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dockerHostId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: networkId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - container
 *             properties:
 *               container:
 *                 type: string
 *                 example: my-container
 *     responses:
 *       200:
 *         description: Container connected successfully
 */
router.post(
    "/:dockerHostId/:networkId/connect",
    authenticate,
    connectContainer
);
/**
 * @swagger
 * /api/networks/{dockerHostId}/{networkId}/disconnect:
 *   post:
 *     summary: Disconnect a container from a Docker network
 *     tags:
 *       - Networks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dockerHostId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: networkId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - container
 *             properties:
 *               container:
 *                 type: string
 *                 example: my-container
 *     responses:
 *       200:
 *         description: Container disconnected successfully
 */
router.post(
    "/:dockerHostId/:networkId/disconnect",
    authenticate,
    disconnectContainer
);
export default router;